import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { X, MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/App";

// WhatsApp SVG icon (official brand color)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function WhatsAppButton() {
  const { lang, isRTL } = useLang();
  const settings = useSiteSettings();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const rawNumber = (settings.whatsapp || "+201142839399").replace(/[^0-9]/g, "");
  const prefilledMessage = lang === "ar"
    ? "مرحباً، أحتاج مساعدة من فريق دعم ماكس جرين إيتس 🌿"
    : "Hello, I need help from Max Green Eats support team 🌿";

  const whatsappUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent(prefilledMessage)}`;

  return (
    <>
      {/* Floating Button */}
      <div
        className="fixed bottom-6 z-50"
        style={{ [isRTL ? "left" : "right"]: "1.5rem" }}
      >
        {/* Chat Panel */}
        {showPanel && (
          <div
            className="absolute bottom-16 mb-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200"
            style={{ [isRTL ? "left" : "right"]: "0" }}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="bg-[#25D366] px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <WhatsAppIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-tight">
                  {isRTL ? "ماكس جرين إيتس" : "Max Green Eats"}
                </p>
                <p className="text-white/80 text-xs">
                  {isRTL ? "فريق الدعم الفني" : "Support Team"}
                </p>
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 bg-[#ECE5DD]">
              {/* Chat bubble */}
              <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 shadow-sm max-w-[85%]">
                <p className="text-gray-800 text-sm leading-relaxed">
                  {isRTL
                    ? "👋 مرحباً! كيف يمكننا مساعدتك اليوم؟ نحن هنا للإجابة على جميع استفساراتك."
                    : "👋 Hello! How can we help you today? We're here to answer all your questions."}
                </p>
                <p className="text-gray-400 text-[10px] mt-1 text-end">
                  {isRTL ? "دعم العملاء" : "Customer Support"}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-white border-t border-gray-100">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#22c55e] text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
              >
                <WhatsAppIcon className="w-4 h-4" />
                {isRTL ? "ابدأ المحادثة" : "Start Chat"}
              </a>
              <p className="text-center text-gray-400 text-[10px] mt-2">
                {isRTL ? "سيتم فتح واتساب" : "WhatsApp will open"}
              </p>
            </div>
          </div>
        )}

        {/* Main FAB */}
        <div className="relative">
          {/* Tooltip */}
          {showTooltip && !showPanel && (
            <div
              className="absolute bottom-full mb-2 whitespace-nowrap bg-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg animate-in fade-in duration-150"
              style={{ [isRTL ? "left" : "right"]: "0" }}
            >
              {isRTL ? "تواصل معنا عبر واتساب" : "Chat with us on WhatsApp"}
              <div
                className="absolute top-full border-4 border-transparent border-t-gray-800"
                style={{ [isRTL ? "left" : "right"]: "12px" }}
              />
            </div>
          )}

          {/* Pulse ring */}
          {!showPanel && (
            <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping" />
          )}

          <button
            onClick={() => { setShowPanel(p => !p); setShowTooltip(false); }}
            onMouseEnter={() => !showPanel && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#22c55e] text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center active:scale-95"
            aria-label={isRTL ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
          >
            {showPanel
              ? <X className="w-6 h-6" />
              : <WhatsAppIcon className="w-7 h-7" />
            }
          </button>
        </div>
      </div>
    </>
  );
}
