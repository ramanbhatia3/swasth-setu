import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Find Services": "Find Services",
      "Specialists": "Specialists",
      "Live Map": "Live Map",
      "AI Report": "AI Report",
      "Feedback": "Feedback",
      "Admin": "Admin",
      "Records": "Records",
      "Logout": "Logout",
      "Sign In": "Sign In",
      "Swasth Setu": "Swasth Setu",
      "Community Health Services": "Community Health Services",
      "Empowering Indian Citizens": "Empowering Indian Citizens",
      "A Transparent & Intelligent": "A Transparent & Intelligent",
      "Healthcare Ecosystem": "Healthcare Ecosystem",
      "Find Hospitals": "Find Hospitals",
      "Ask AI Assistant": "Ask AI Assistant",
      "Specialist Directory": "Specialist Directory",
      "Medical Records": "Medical Records",
      "Find Specialized Care": "Find Specialized Care",
      "Share Your Experience": "Share Your Experience",
      "Compare Hospitals": "Compare Hospitals"
    }
  },
  hi: {
    translation: {
      "Find Services": "सेवाएँ खोजें",
      "Specialists": "विशेषज्ञ",
      "Live Map": "लाइव मैप",
      "AI Report": "एआई रिपोर्ट",
      "Feedback": "प्रतिक्रिया",
      "Admin": "व्यवस्थापक",
      "Records": "रिकॉर्ड्स",
      "Logout": "लॉग आउट",
      "Sign In": "साइन इन करें",
      "Swasth Setu": "स्वस्थ सेतु",
      "Community Health Services": "सामुदायिक स्वास्थ्य सेवाएँ",
      "Empowering Indian Citizens": "भारतीय नागरिकों का सशक्तिकरण",
      "A Transparent & Intelligent": "एक पारदर्शी और बुद्धिमान",
      "Healthcare Ecosystem": "स्वास्थ्य सेवा पारिस्थितिकी तंत्र",
      "Find Hospitals": "अस्पताल खोजें",
      "Ask AI Assistant": "AI सहायक से पूछें",
      "Specialist Directory": "विशेषज्ञ निर्देशिका",
      "Medical Records": "मेडिकल रिकॉर्ड्स",
      "Find Specialized Care": "विशेषज्ञ देखभाल खोजें",
      "Share Your Experience": "अपना अनुभव साझा करें",
      "Compare Hospitals": "अस्पतालों की तुलना करें"
    }
  },
  pa: {
    translation: {
      "Find Services": "ਸੇਵਾਵਾਂ ਲੱਭੋ",
      "Specialists": "ਮਾਹਰ",
      "Live Map": "ਲਾਈਵ ਮੈਪ",
      "AI Report": "ਏਆਈ ਰਿਪੋਰਟ",
      "Feedback": "ਫੀਡਬੈਕ",
      "Admin": "ਐਡਮਿਨ",
      "Records": "ਰਿਕਾਰਡ",
      "Logout": "ਲੌਗ ਆਉਟ",
      "Sign In": "ਸਾਈਨ ਇਨ",
      "Swasth Setu": "ਸਵਸਥ ਸੇਤੂ",
      "Community Health Services": "ਕਮਿਊਨਿਟੀ ਸਿਹਤ ਸੇਵਾਵਾਂ",
      "Empowering Indian Citizens": "ਭਾਰਤੀ ਨਾਗਰਿਕਾਂ ਨੂੰ ਸ਼ਕਤੀਕਰਨ",
      "A Transparent & Intelligent": "ਇੱਕ ਪਾਰਦਰਸ਼ੀ ਅਤੇ ਬੁੱਧੀਮਾਨ",
      "Healthcare Ecosystem": "ਸਿਹਤ ਸੰਭਾਲ ਈਕੋਸਿਸਟਮ",
      "Find Hospitals": "ਹਸਪਤਾਲ ਲੱਭੋ",
      "Ask AI Assistant": "AI ਸਹਾਇਕ ਨੂੰ ਪੁੱਛੋ",
      "Specialist Directory": "ਮਾਹਰ ਡਾਇਰੈਕਟਰੀ",
      "Medical Records": "ਮੈਡੀਕਲ ਰਿਕਾਰਡ",
      "Find Specialized Care": "ਵਿਸ਼ੇਸ਼ ਦੇਖਭਾਲ ਲੱਭੋ",
      "Share Your Experience": "ਆਪਣਾ ਅਨੁਭਵ ਸਾਂਝਾ ਕਰੋ",
      "Compare Hospitals": "ਹਸਪਤਾਲਾਂ ਦੀ ਤੁਲਨਾ ਕਰੋ"
    }
  },
  ta: {
    translation: {
      "Find Services": "சேவைகளைத் தேடு",
      "Specialists": "நிபுணர்கள்",
      "Live Map": "நேரடி வரைபடம்",
      "AI Report": "AI அறிக்கை",
      "Feedback": "பின்னூட்டம்",
      "Admin": "நிர்வாகி",
      "Records": "பதிவுகள்",
      "Logout": "வெளியேறு",
      "Sign In": "உள்நுழைக",
      "Swasth Setu": "ஸ்வஸ்த் சேது",
      "Community Health Services": "சமூக சுகாதார சேவைகள்",
      "Empowering Indian Citizens": "இந்திய குடிமக்களுக்கு அதிகாரமளித்தல்",
      "A Transparent & Intelligent": "ஒரு வெளிப்படையான மற்றும் அறிவார்ந்த",
      "Healthcare Ecosystem": "சுகாதார சுற்றுச்சூழல் அமைப்பு",
      "Find Hospitals": "மருத்துவமனைகளைத் தேடு",
      "Ask AI Assistant": "AI உதவியாளரிடம் கேளுங்கள்",
      "Specialist Directory": "நிபுணர் அடைவு",
      "Medical Records": "மருத்துவ பதிவுகள்",
      "Find Specialized Care": "சிறப்புப் பராமரிப்பைத் தேடு",
      "Share Your Experience": "உங்கள் அனுபவத்தைப் பகிரவும்",
      "Compare Hospitals": "மருத்துவமனைகளை ஒப்பிடுக"
    }
  },
  te: {
    translation: {
      "Find Services": "సేవలను కనుగొనండి",
      "Specialists": "నిపుణులు",
      "Live Map": "లైవ్ మ్యాప్",
      "AI Report": "AI నివేదిక",
      "Feedback": "ఫీడ్‌బ్యాక్",
      "Admin": "అడ్మిన్",
      "Records": "రికార్డులు",
      "Logout": "లాగ్ అవుట్",
      "Sign In": "సైన్ ఇన్",
      "Swasth Setu": "స్వస్థ్ సేతు",
      "Community Health Services": "కమ్యూనిటీ ఆరోగ్య సేవలు",
      "Empowering Indian Citizens": "భారతీయ పౌరులకు సాధికారత",
      "A Transparent & Intelligent": "పారదర్శకమైన మరియు తెలివైన",
      "Healthcare Ecosystem": "ఆరోగ్య సంరక్షణ పర్యావరణ వ్యవస్థ",
      "Find Hospitals": "ఆసుపత్రులను కనుగొనండి",
      "Ask AI Assistant": "AI సహాయకుడిని అడగండి",
      "Specialist Directory": "నిపుణుల డైరెక్టరీ",
      "Medical Records": "వైద్య రికార్డులు",
      "Find Specialized Care": "ప్రత్యేక సంరక్షణను కనుగొనండి",
      "Share Your Experience": "మీ అనుభవాన్ని పంచుకోండి",
      "Compare Hospitals": "ఆసుపత్రులను సరిపోల్చండి"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
