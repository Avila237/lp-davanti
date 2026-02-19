import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/logo-davanti-laranja.png";
import { useAnalytics } from "@/hooks/use-analytics";
import { ABTestCTA } from "./ABTestCTA";

const menuItems = [
  { label: "Início", href: "#inicio" },
  { label: "Produtos", href: "#produtos" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Exclusivos", href: "#exclusivos" },
  { label: "Lojas", href: "#lojas" },
  { label: "Contato", href: "#contato" },
];

export const Header = () => {
  const { trackEvent } = useAnalytics();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCall = () => {
    trackEvent('phone_call', {
      section: 'header',
      button_text: 'Ligar'
    });
    window.location.href = "tel:+5555991166688";
  };

  const handleNavClick = (href: string, label?: string) => {
    if (label) {
      trackEvent('navigation_click', {
        link_name: label,
        link_section: href
      });
    }
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${
        isScrolled
          ? "bg-[hsl(222,47%,11%)]/95 backdrop-blur-md shadow-elegant"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo e Nome */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("#inicio");
            }}
            className="flex items-center gap-3 hover:opacity-80 transition-smooth"
          >
            <img src={logo} alt="Logo Óptica Davanti" className="h-12 w-12 md:h-14 md:w-14 object-contain" />
            <span className="text-xl font-bold text-white hidden sm:block">
              Óptica Davanti
            </span>
          </a>

          {/* Menu Desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href, item.label);
                }}
                className="text-white/80 hover:text-secondary transition-smooth font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Botões Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <ABTestCTA
              section="header"
              buttonText="WhatsApp"
              whatsappNumber="5555991166688"
              whatsappMessage="Olá, vim pelo site e gostaria de informações"
              variant="whatsapp"
              size="sm"
              icon={<MessageCircle className="h-4 w-4" />}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCall}
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
            >
              <Phone className="h-4 w-4" />
              Ligar
            </Button>
          </div>

          {/* Menu Mobile */}
          <div className="flex lg:hidden items-center gap-2">
            <ABTestCTA
              section="header_mobile"
              buttonText=""
              whatsappNumber="5555991166688"
              whatsappMessage="Olá, vim pelo site e gostaria de informações"
              variant="whatsapp"
              size="sm"
              icon={<MessageCircle className="h-4 w-4" />}
              showIcon={true}
            />

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  {isOpen ? <X /> : <Menu />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[hsl(222,47%,11%)] border-white/10">
                <nav className="flex flex-col gap-6 mt-8">
                  {menuItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(item.href, item.label);
                      }}
                      className="text-white text-lg hover:text-secondary transition-smooth font-medium"
                    >
                      {item.label}
                    </a>
                  ))}
                  <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/10">
                    <ABTestCTA
                      section="header_mobile_menu"
                      buttonText="WhatsApp"
                      whatsappNumber="5555991166688"
                      whatsappMessage="Olá, vim pelo site e gostaria de informações"
                      variant="whatsapp"
                      className="w-full"
                      icon={<MessageCircle className="h-4 w-4" />}
                    />
                    <Button
                      variant="outline"
                      onClick={handleCall}
                      className="w-full bg-white/10 text-white border-white/30 hover:bg-white/20"
                    >
                      <Phone className="h-4 w-4" />
                      Ligar
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
