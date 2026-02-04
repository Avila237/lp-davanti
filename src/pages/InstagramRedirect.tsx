import { useEffect } from "react";

const InstagramRedirect = () => {
  useEffect(() => {
    // Constrói a URL de destino com parâmetros UTM
    const utmParams = new URLSearchParams({
      utm_source: "instagram",
      utm_medium: "social",
      utm_campaign: "bio_link",
    });

    // Redireciona para a home com os UTMs
    window.location.href = `/?${utmParams.toString()}`;
  }, []);

  // Renderiza null enquanto redireciona (instantâneo)
  return null;
};

export default InstagramRedirect;
