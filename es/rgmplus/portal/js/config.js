/* RGM+ · Configuración del portal.
   Todo lo que Ale pueda querer cambiar sin tocar el código está aquí. */
window.RGM_CONFIG = {
  // Mientras sea true se muestra la etiqueta "Vista previa" y el inicio de sesión es SIMULADO.
  previewMode: true,

  // Idiomas del portal (interfaz, subtítulos y audio doblado)
  languages: ['es', 'pt', 'en'],
  defaultLang: 'es',

  // Precios (los mismos de las landings actuales)
  price: { month: 5, year: 50, currency: 'USD' },

  // Hoy los hipervínculos de suscripción apuntan al portal de pagos de Holding Mentors
  subscribeUrl: 'https://www.holdingmentors.com/rgmplus',

  // Usuario de demostración (hasta conectar el acceso real)
  demoUser: { name: 'Ale Motta', tokens: 1 },

  // Sitios recomendados del zócalo. {lang} se reemplaza por es / pt / en.
  // Las URLs marcadas "provisional" hay que confirmarlas.
  sites: [
    { key: 'academia',  url: 'https://www.academiaglobalrgm.com/' },                    // provisional
    { key: 'editorial', url: 'https://www.editorialrgm.com/' },                         // provisional
    { key: 'directorio', url: 'https://www.redglobaldementores.org/{lang}/' },          // provisional (ajustar a la sección Directorio)
    { key: 'encuentros', url: 'https://www.holdingmentors.com/proximosencuentros' }
  ],
  backUrl: 'https://www.redglobaldementores.org/{lang}/',

  // Imágenes opcionales para el collage de la portada (si está vacío se usan mosaicos de color)
  collage: []
};
