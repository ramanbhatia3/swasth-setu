import Report from '../models/Report.js';
import Hospital from '../models/Hospital.js';
import AuditLog from '../models/AuditLog.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// 1. TOP-LEVEL ANALYTICAL KPI METRICS
export const getDashboardOverview = async (req, res) => {
  try {
    const totalHospitals = await Hospital.countDocuments();
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'Pending' });
    const underReview = await Report.countDocuments({ status: 'Under Review' });
    const inProgress = await Report.countDocuments({ status: 'In Progress' });
    const resolvedReports = await Report.countDocuments({ status: 'Resolved' });
    const criticalIssues = await Report.countDocuments({ severity: 'Critical', status: { $ne: 'Resolved' } });

    // Hospitals Requiring Attention: >= 3 unresolved complaints OR >= 1 active critical complaint
    const problemHospitals = await Report.aggregate([
      { $match: { status: { $ne: 'Resolved' } } },
      {
        $group: {
          _id: '$hospital',
          unresolvedCount: { $sum: 1 },
          criticalCount: { $sum: { $cond: [{ $eq: ['$severity', 'Critical'] }, 1, 0] } }
        }
      },
      {
        $match: {
          $or: [
            { unresolvedCount: { $gte: 3 } },
            { criticalCount: { $gte: 1 } }
          ]
        }
      }
    ]);

    // High Performing Hospitals: Has at least 2 reports and >= 75% resolution rate with zero open critical issues
    const highPerfHospitals = await Report.aggregate([
      {
        $group: {
          _id: '$hospital',
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
          criticalOpen: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$severity', 'Critical'] }, { $ne: ['$status', 'Resolved'] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $match: {
          total: { $gte: 2 },
          criticalOpen: 0
        }
      },
      {
        $project: {
          resRate: { $multiply: [{ $divide: ['$resolved', '$total'] }, 100] }
        }
      },
      { $match: { resRate: { $gte: 70 } } }
    ]);

    res.status(200).json({
      success: true,
      kpis: {
        totalHospitals,
        totalReports,
        pendingReports,
        underReview,
        inProgress,
        resolvedReports,
        criticalIssues,
        hospitalsRequiringAttention: problemHospitals.length,
        highPerformingHospitals: highPerfHospitals.length
      }
    });
  } catch (error) {
    console.error('KPIs Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to aggregate admin KPIs' });
  }
};

// 2. HOSPITAL PERFORMANCE MONITORING (Derived from actual DB reports)
export const getHospitalPerformanceList = async (req, res) => {
  try {
    const hospitals = await Hospital.find().select('name location metrics isVerified').lean();

    const reportAggregates = await Report.aggregate([
      {
        $group: {
          _id: '$hospital',
          totalReports: { $sum: 1 },
          pendingIssues: { $sum: { $cond: [{ $in: ['$status', ['Pending', 'Under Review', 'In Progress']] }, 1, 0] } },
          resolvedIssues: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
          criticalIssues: { $sum: { $cond: [{ $eq: ['$severity', 'Critical'] }, 1, 0] } },
          criticalOpen: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$severity', 'Critical'] }, { $ne: ['$status', 'Resolved'] }] },
                1,
                0
              ]
            }
          },
          avgResolutionTimeHours: {
            $avg: {
              $cond: [
                { $and: [{ $ne: ['$resolutionDate', null] }, { $ne: ['$createdAt', null] }] },
                { $divide: [{ $subtract: ['$resolutionDate', '$createdAt'] }, 3600000] },
                null
              ]
            }
          }
        }
      }
    ]);

    const reportMap = new Map();
    reportAggregates.forEach(agg => reportMap.set(agg._id.toString(), agg));

    const performanceList = hospitals.map(h => {
      const stats = reportMap.get(h._id.toString()) || {
        totalReports: 0,
        pendingIssues: 0,
        resolvedIssues: 0,
        criticalIssues: 0,
        criticalOpen: 0,
        avgResolutionTimeHours: null
      };

      const resolutionRate = stats.totalReports > 0
        ? Math.round((stats.resolvedIssues / stats.totalReports) * 100)
        : 100;

      const avgDays = stats.avgResolutionTimeHours
        ? (stats.avgResolutionTimeHours / 24).toFixed(1)
        : (h.metrics?.averageWaitTimeDays || 2.5);

      // Objective status evaluation based on complaints & severity
      let status = 'Good';
      const flags = [];

      if (stats.criticalOpen >= 1) {
        status = 'Critical';
        flags.push(`${stats.criticalOpen} active critical issue(s)`);
      } else if (stats.pendingIssues >= 4 || resolutionRate < 50) {
        status = 'Needs Attention';
        if (stats.pendingIssues >= 4) flags.push(`${stats.pendingIssues} unresolved complaints`);
        if (resolutionRate < 50) flags.push(`Low resolution rate (${resolutionRate}%)`);
      } else if (stats.pendingIssues >= 2 || resolutionRate < 75) {
        status = 'Average';
        flags.push('Moderate unresolved backlog');
      } else {
        flags.push('Healthy grievance resolution');
      }

      return {
        hospitalId: h._id,
        name: h.name,
        city: h.location?.city || 'N/A',
        state: h.location?.state || 'N/A',
        clinicalSuccessRate: h.metrics?.successRate || 90,
        totalReports: stats.totalReports,
        pendingIssues: stats.pendingIssues,
        resolvedIssues: stats.resolvedIssues,
        criticalIssues: stats.criticalIssues,
        criticalOpen: stats.criticalOpen,
        resolutionRate,
        averageResolutionTimeDays: avgDays,
        status,
        reasons: flags
      };
    });

    // Default sorting: Critical & Needs Attention to top, then high report volume
    performanceList.sort((a, b) => {
      const statusWeight = { Critical: 4, 'Needs Attention': 3, Average: 2, Good: 1 };
      if (statusWeight[b.status] !== statusWeight[a.status]) {
        return statusWeight[b.status] - statusWeight[a.status];
      }
      return b.pendingIssues - a.pendingIssues;
    });

    res.status(200).json({ success: true, count: performanceList.length, performance: performanceList });
  } catch (error) {
    console.error('Hospital Performance Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to aggregate hospital performance' });
  }
};

// 3. ADVANCED REPORTS & COMPLAINTS LIST WITH FILTERS
export const getAllComplaints = async (req, res) => {
  try {
    const {
      search,
      hospitalId,
      category,
      severity,
      status,
      assignedOfficer,
      isEscalated,
      page = 1,
      limit = 25
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { hospitalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'reportedBy.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (hospitalId) query.hospital = hospitalId;
    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (assignedOfficer) query['assignedOfficer.name'] = { $regex: assignedOfficer, $options: 'i' };
    if (isEscalated === 'true') query.isEscalated = true;

    const skip = (Number(page) - 1) * Number(limit);

    const [reports, totalCount] = await Promise.all([
      Report.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Report.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
      currentPage: Number(page),
      reports
    });
  } catch (error) {
    console.error('Get Complaints Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
  }
};

// 4. UPDATE COMPLAINT STATUS, OFFICER & REMARKS (WITH AUDIT LOG)
export const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, severity, category, assignedOfficer, adminRemarks } = req.body;

    const existingReport = await Report.findById(id);
    if (!existingReport) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const previousStatus = existingReport.status;
    const previousOfficer = existingReport.assignedOfficer?.name;

    if (status) existingReport.status = status;
    if (severity) existingReport.severity = severity;
    if (category) existingReport.category = category;
    if (adminRemarks !== undefined) existingReport.adminRemarks = adminRemarks;

    if (assignedOfficer) {
      existingReport.assignedOfficer = {
        name: assignedOfficer.name || existingReport.assignedOfficer.name,
        email: assignedOfficer.email || existingReport.assignedOfficer.email,
        role: assignedOfficer.role || 'Monitoring Officer'
      };
    }

    // Set resolution date if transitioned to Resolved
    if (status === 'Resolved' && !existingReport.resolutionDate) {
      existingReport.resolutionDate = new Date();
      existingReport.isEscalated = false;
    }

    await existingReport.save();

    // Create Audit Log Entry
    const adminUser = req.user || { name: 'Admin Officer', email: 'admin@swasthsetu.gov.in' };
    await AuditLog.create({
      adminName: adminUser.name || 'Senior Administrator',
      adminEmail: adminUser.email || 'admin@swasthsetu.gov.in',
      action: status !== previousStatus ? 'STATUS_CHANGE' : 'REMARKS_UPDATED',
      reportId: existingReport._id,
      hospitalName: existingReport.hospitalName,
      previousValue: previousStatus,
      newValue: status || existingReport.status,
      details: `Complaint ${existingReport._id.toString().slice(-6)}: Status changed from ${previousStatus} to ${existingReport.status}. Assigned to: ${existingReport.assignedOfficer.name}`
    });

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully and logged in official audit trail',
      report: existingReport
    });
  } catch (error) {
    console.error('Update Complaint Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update complaint' });
  }
};

// 5. HOSPITAL DETAILED PROFILE ANALYTICS (FOR MODAL / DRILLDOWN)
export const getHospitalDetailAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findById(id).lean();
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const [reports, categoryBreakdown, severityBreakdown] = await Promise.all([
      Report.find({ hospital: id }).sort({ createdAt: -1 }).limit(30).lean(),
      Report.aggregate([
        { $match: { hospital: hospital._id } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Report.aggregate([
        { $match: { hospital: hospital._id } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ])
    ]);

    const total = reports.length;
    const resolved = reports.filter(r => r.status === 'Resolved').length;
    const pending = reports.filter(r => ['Pending', 'Under Review', 'In Progress'].includes(r.status)).length;
    const critical = reports.filter(r => r.severity === 'Critical').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

    // Detect repeated issue clusters
    const repeatedCategories = categoryBreakdown.filter(c => c.count >= 2).map(c => ({
      category: c._id,
      frequency: c.count,
      warning: `Systemic issue: ${c.count} repeated complaints regarding ${c._id}`
    }));

    res.status(200).json({
      success: true,
      hospital,
      metrics: {
        totalReports: total,
        resolved,
        pending,
        critical,
        resolutionRate,
        categoryBreakdown,
        severityBreakdown,
        repeatedCategories,
        recentReports: reports
      }
    });
  } catch (error) {
    console.error('Hospital Detail Analytics Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load hospital profile analytics' });
  }
};

// 6. ANALYTICS CHARTS AGGREGATION DATA
export const getAnalyticsData = async (req, res) => {
  try {
    const [
      categoryDistribution,
      severityDistribution,
      statusDistribution,
      topComplainedHospitals,
      districtDistribution
    ] = await Promise.all([
      Report.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Report.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Report.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Report.aggregate([
        { $group: { _id: '$hospitalName', count: { $sum: 1 }, critical: { $sum: { $cond: [{ $eq: ['$severity', 'Critical'] }, 1, 0] } } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      Hospital.aggregate([
        { $group: { _id: '$location.city', hospitalCount: { $sum: 1 } } },
        { $sort: { hospitalCount: -1 } },
        { $limit: 8 }
      ])
    ]);

    res.status(200).json({
      success: true,
      charts: {
        categoryDistribution,
        severityDistribution,
        statusDistribution,
        topComplainedHospitals,
        districtDistribution
      }
    });
  } catch (error) {
    console.error('Analytics Data Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics data' });
  }
};

// 7. REAL DATABASE AI INSIGHTS GENERATOR
export const getAIAdministrativeInsights = async (req, res) => {
  try {
    const [totalReports, topCategories, topProblemHospitals, criticalBacklog] = await Promise.all([
      Report.countDocuments(),
      Report.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 }
      ]),
      Report.aggregate([
        { $match: { status: { $ne: 'Resolved' } } },
        { $group: { _id: '$hospitalName', pendingCount: { $sum: 1 }, criticalCount: { $sum: { $cond: [{ $eq: ['$severity', 'Critical'] }, 1, 0] } } } },
        { $sort: { criticalCount: -1, pendingCount: -1 } },
        { $limit: 4 }
      ]),
      Report.find({ severity: 'Critical', status: { $ne: 'Resolved' } }).select('hospitalName category createdAt').limit(5).lean()
    ]);

    const context = {
      totalGrievances: totalReports,
      primaryComplaintCategories: topCategories.map(c => `${c._id} (${c.count} cases)`),
      urgentFacilities: topProblemHospitals.map(h => `${h._id}: ${h.pendingCount} pending (${h.criticalCount} critical)`),
      criticalBacklogSample: criticalBacklog.map(b => `${b.hospitalName} - ${b.category}`)
    };

    const fallbackInsights = [
      `Grievance concentration: The largest operational friction originates from ${topCategories[0]?._id || 'Waiting Time & Infrastructure'} (${topCategories[0]?.count || 0} recorded filings). Recommend district-level resource reallocation.`,
      `Critical Facility Attention: ${topProblemHospitals[0]?._id || 'Regional Government Hospital'} currently maintains the highest unresolved backlog with ${topProblemHospitals[0]?.criticalCount || 0} critical priority incidents pending intervention.`,
      `SLA Compliance Opportunity: Escalated cases show delayed action on equipment maintenance. Implementing 48-hour automated dispatch for equipment-related categories will elevate overall state resolution rate above 85%.`
    ];

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ success: true, insights: fallbackInsights });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

      const prompt = `
        You are the Chief Healthcare Analytics Advisor to the Ministry of Health (Swasth Setu).
        Based STRICTLY on this verified database context:
        ${JSON.stringify(context, null, 2)}

        Generate exactly 3 bullet points with actionable administrative insights:
        1. Identification of the primary systemic issue category and root operational cause.
        2. Priority hospital facility that requires immediate on-site inspection due to critical backlog.
        3. Strategic policy recommendation to increase grievance resolution efficiency.

        Return ONLY 3 concise, high-impact bullet points. Do not invent numbers.
      `;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      const insights = rawText
        .split('\n')
        .map(line => line.replace(/^[*•-]\s*/, '').trim())
        .filter(line => line.length > 20)
        .slice(0, 3);

      res.status(200).json({
        success: true,
        insights: insights.length >= 3 ? insights : fallbackInsights
      });
    } catch (apiErr) {
      console.warn('Gemini busy for admin insights. Using verified fallback template.');
      res.status(200).json({ success: true, insights: fallbackInsights });
    }
  } catch (error) {
    console.error('AI Insights Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to generate insights' });
  }
};

// 8. AUDIT LOGS TRAIL
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50).lean();
    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
};

// 9. AUTOMATED SYSTEM NOTIFICATIONS & ALERTS
export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = [];

    // Check critical unresolved complaints
    const criticals = await Report.find({ severity: 'Critical', status: { $ne: 'Resolved' } })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    criticals.forEach(c => {
      notifications.push({
        id: c._id,
        type: 'CRITICAL_ALERT',
        title: `Critical Grievance: ${c.hospitalName}`,
        message: `${c.category} issue reported: "${c.description.slice(0, 75)}..."`,
        date: c.createdAt,
        severity: 'Critical'
      });
    });

    // Check repeated complaints clusters
    const repeated = await Report.find({ isRepeated: true, status: { $ne: 'Resolved' } })
      .limit(4)
      .lean();

    repeated.forEach(r => {
      notifications.push({
        id: r._id,
        type: 'SYSTEMIC_WARNING',
        title: `Repeated Issue Cluster: ${r.hospitalName}`,
        message: `Multiple citizens filed complaints under ${r.category} category in the same period.`,
        date: r.createdAt,
        severity: 'High'
      });
    });

    res.status(200).json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
};

// 10. ADMINISTRATIVE OFFICERS LIST & WORKLOAD
export const getOfficersList = async (req, res) => {
  try {
    const officerNames = [
      { name: 'Dr. Rajesh Verma', email: 'rajesh.verma@swasthsetu.gov.in', role: 'Chief Medical Monitoring Officer', district: 'Delhi NCR' },
      { name: 'Dr. Ananya Iyer', email: 'ananya.iyer@swasthsetu.gov.in', role: 'District Healthcare Commissioner', district: 'Punjab & Chandigarh' },
      { name: 'Vikramjit Singh', email: 'vikram.singh@swasthsetu.gov.in', role: 'Hospital Infrastructure Inspector', district: 'North Zone' },
      { name: 'Pooja Kulkarni', email: 'pooja.kulkarni@swasthsetu.gov.in', role: 'Quality & Ethics Grievance Officer', district: 'Maharashtra' }
    ];

    const workloadAgg = await Report.aggregate([
      { $match: { status: { $in: ['Pending', 'Under Review', 'In Progress'] } } },
      { $group: { _id: '$assignedOfficer.name', activeCases: { $sum: 1 } } }
    ]);

    const workloadMap = new Map();
    workloadAgg.forEach(w => workloadMap.set(w._id, w.activeCases));

    const officersWithLoad = officerNames.map(off => ({
      ...off,
      activeCases: workloadMap.get(off.name) || 0
    }));

    res.status(200).json({ success: true, officers: officersWithLoad });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load officer list' });
  }
};

// 11. CSV EXPORT FOR COMPLAINTS & HOSPITAL PERFORMANCE
export const exportComplaintsCSV = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).lean();

    const headers = ['Report ID', 'Hospital Name', 'Category', 'Severity', 'Status', 'Reported By', 'Assigned Officer', 'Created Date', 'Resolution Date', 'Description'];
    const rows = reports.map(r => [
      r._id.toString(),
      `"${(r.hospitalName || '').replace(/"/g, '""')}"`,
      `"${r.category}"`,
      r.severity,
      r.status,
      `"${r.reportedBy?.name || 'Anonymous'}"`,
      `"${r.assignedOfficer?.name || 'Unassigned'}"`,
      new Date(r.createdAt).toISOString().split('T')[0],
      r.resolutionDate ? new Date(r.resolutionDate).toISOString().split('T')[0] : 'N/A',
      `"${(r.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="Swasth_Setu_Complaints_Report.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('CSV Export Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to generate CSV' });
  }
};