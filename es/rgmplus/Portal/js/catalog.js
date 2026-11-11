/* RGM+ · Catálogo (CONTENIDO PROVISORIO: todos los registros usan el mismo video y la misma miniatura).

   Cada video tiene los campos de la futura base de datos:
     video ........ archivo mp4                    duration ..... duración en segundos
     title ........ título (es/pt/en)              description .. descripción (es/pt/en)
     author ....... autor o entrevistador          others ....... otros participantes (nombres)
     section ...... Presentations | MasterClass | Interviews-Panels | Storytelling
     category ..... Human | Business | … (12)      tags ......... hashtags
   Además: orig (idioma original), subs (subtítulos), dub (audio traducido), thumb (miniatura).

   Para agregar un video: copiar una fila de VIDEOS. Cuando exista la base de datos, este
   archivo se reemplaza por una exportación de la base (mismo formato). */
(function () {
  var T = function (es, pt, en) { return { es: es, pt: pt, en: en }; };
  var VIDEO = 'assets/video/amarilis-vellon-el-valor-de-la-familia.mp4';
  var HLS = 'https://vz-6a7af8bf-f99.b-cdn.net/ea117928-13c6-4698-b2f9-eb491bc44017/playlist.m3u8'; // Bunny Stream (biblioteca RGM+)
  var THUMB = 'assets/img/valor-de-la-familia.jpg';
  var DEMO = 'assets/demo/';
  var SLIDE = function (s) { return 'assets/img/slide-' + s + '.jpg'; }; // imagen del slide de la portada (una por sección)

  // path = carpeta de la URL (distingue mayúsculas en GitHub Pages)
  var SECTIONS = [
    { id: 'presentations', path: 'Presentations' },
    { id: 'masterclass', path: 'MasterClass' },
    { id: 'interviews-panels', path: 'Interviews-Panels' },
    { id: 'storytelling', path: 'Storytelling' }
  ];
  var CATEGORIES = ['human', 'business', 'education', 'sport', 'technology', 'public', 'family', 'culture', 'health', 'environment', 'workers', 'skills']
    .map(function (id) { return { id: id, path: id.charAt(0).toUpperCase() + id.slice(1) }; });

  var AUTHORS = [
    { id: 'amarilis', name: 'Amarilis Vellon', photo: 'assets/img/amarilis-vellon.jpg',
      bio: T('Mentora de la Red Global de Mentores. Biografía provisoria.', 'Mentora da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'clara', name: 'Clara María', photo: null,
      bio: T('Mentora y facilitadora de procesos de aprendizaje. Biografía provisoria.', 'Mentora e facilitadora de processos de aprendizagem. Biografia provisória.', 'Mentor and learning facilitator. Provisional biography.') },
    { id: 'mateus', name: 'Mateus Faria', photo: null,
      bio: T('Mentor certificado y conferencista. Biografía provisoria.', 'Mentor certificado e orador. Biografia provisória.', 'Certified mentor and speaker. Provisional biography.') },
    { id: 'david', name: 'David Whitmore', photo: null,
      bio: T('Consultor y mentor en desarrollo organizacional. Biografía provisoria.', 'Consultor e mentor em desenvolvimento organizacional. Biografia provisória.', 'Consultant and mentor in organisational development. Provisional biography.') },
    { id: 'alejandro-motta', name: "Alejandro Motta", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'aldo-tomas-pinero', name: "Aldo Tomás Piñero", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'alvaro-yair-pinilla-silva', name: "Alvaro Yair Pinilla Silva", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'daniel-rosales', name: "Daniel Rosales", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'ana-maria-bonotti', name: "Ana Maria Bonotti", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'adriana-gomez', name: "Adriana Gomez", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'angeles-diaz', name: "Angeles Diaz", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'angela-kohler', name: "Angela Kohler", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'cristina-mejias', name: "Cristina Mejias", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'barreto-navarro-zoila-beatriz', name: "Barreto Navarro Zoila Beatriz", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'diego-repetto', name: "Diego Repetto", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'dora-rozo', name: "Dora Rozo", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'edison-guerrero-quintero', name: "Edison Guerrero Quintero", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'elita-salinas', name: "Elita Salinas", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'gabriel-vazquez', name: "Gabriel Vazquez", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'daniel-tigani', name: "Daniel Tigani", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'blanca-llontop', name: "Blanca Llontop", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'daniela-algeri', name: "Daniela Algeri", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'gina-lisset-garcia-cardoza', name: "Gina Lisset García Cardoza", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'margarita-gibson', name: "Margarita Gibson", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'victoria-roldan', name: "Victoria Roldan", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'parra-nehemias', name: "Parra Nehemias", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'odar-alexander-carranza-reyes', name: "Odar Alexander Carranza Reyes", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'maria-segunda', name: "Maria Segunda", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'mauricio-louzada', name: "Mauricio Louzada", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'ivan-lavin-lopez', name: "Ivan Lavin Lopez", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'javier-garcia-delgado', name: "Javier Garcia Delgado", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'karin-veronica-espinoza', name: "Karin Verónica Espinoza", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'kleber-rodrigues', name: "Kleber Rodrigues", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'laura-duda', name: "Laura Duda", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'laura-vaccarini', name: "Laura Vaccarini", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'marcela-barbita', name: "Marcela Barbita", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'rafael-guillermo-hernandez-molina', name: "Rafael Guillermo Hernández Molina", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'rodolfo-cremer', name: "Rodolfo Cremer", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'rosario-socualaya', name: "Rosario Socualaya", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'walter-teran-chiriboga', name: "Walter Teran Chiriboga", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'yesenia-ysabel-cabrera-aspajo', name: "Yesenia Ysabel Cabrera Aspajo", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'mauricio-souto', name: "Mauricio Souto", photo: null,
      bio: T('Mentor/a de la Red Global de Mentores. Biografía provisoria.', 'Mentor/a da Rede Global de Mentores. Biografia provisória.', 'Mentor of the Global Mentoring Network. Provisional biography.') },
    { id: 'lucia', name: 'Lucía Herrera', photo: null,
      bio: T('Docente mentora. Biografía provisoria.', 'Docente mentora. Biografia provisória.', 'Teacher and mentor. Provisional biography.') }
  ];

  var DESC = {
    'presentations': T('Descripción provisoria: presentación registrada, disponible a demanda.', 'Descrição provisória: apresentação registada, disponível a pedido.', 'Provisional description: recorded presentation, available on demand.'),
    'masterclass': T('Descripción provisoria: clase magistral de un mentor de la comunidad.', 'Descrição provisória: aula magistral de um mentor da comunidade.', 'Provisional description: masterclass by a community mentor.'),
    'interviews-panels': T('Descripción provisoria: conversación o panel con mentores y referentes.', 'Descrição provisória: conversa ou painel com mentores e referências.', 'Provisional description: conversation or panel with mentors and leading figures.'),
    'storytelling': T('Descripción provisoria: un relato personal contado por su protagonista.', 'Descrição provisória: um relato pessoal contado pelo seu protagonista.', 'Provisional description: a personal story told by its protagonist.')
  };

  // [id, sección, categoría, autor, otros participantes, hashtags, título, destacado]
  var V = [
    ['p1','presentations','family','amarilis',[],['familia','valores','emotivo'],T('El valor de la Familia','O valor da Família','The value of the Family'),1],
    ['p2','presentations','business','mateus',[],['liderazgo','practica'],T('Mentoría en las empresas familiares','Mentoria nas empresas familiares','Mentoring in family businesses')],
    ['p3','presentations','education','lucia',[],['practica','crecimiento'],T('La mentoría en el aula','A mentoria na sala de aula','Mentoring in the classroom')],
    ['p4','presentations','culture','clara',[],['historia','comunidad'],T('Cultura y mentoría','Cultura e mentoria','Culture and mentoring')],
    ['p5','presentations','environment','david',[],['comunidad','valores'],T('Mentoría y cuidado del ambiente','Mentoria e cuidado do ambiente','Mentoring and caring for the environment')],

    ['m1','masterclass','human','clara',[],['emotivo','inspirador','crecimiento'],T('Ideas para el crecimiento','Ideias para o crescimento','Ideas for growth'),1],
    ['m2','masterclass','skills','mateus',[],['practica','liderazgo'],T('Habilidades del mentor','Competências do mentor','Skills of the mentor')],
    ['m3','masterclass','technology','david',[],['practica','crecimiento'],T('Tecnología al servicio de la mentoría','Tecnologia ao serviço da mentoria','Technology in the service of mentoring')],
    ['m4','masterclass','workers','lucia',[],['practica','comunidad'],T('Mentoría para trabajadores','Mentoria para trabalhadores','Mentoring for workers')],
    ['m5','masterclass','health','clara',[],['crecimiento','valores'],T('Mentoría y bienestar','Mentoria e bem-estar','Mentoring and well-being')],

    ['i1','interviews-panels','public','mateus',['Clara María','David Whitmore'],['liderazgo','etica'],T('Panel: la mentoría en el sector público','Painel: a mentoria no setor público','Panel: mentoring in the public sector'),1],
    ['i2','interviews-panels','sport','david',['Lucía Herrera'],['inspirador','liderazgo'],T('Entrevista: mentoría en el deporte','Entrevista: mentoria no desporto','Interview: mentoring in sport')],
    ['i3','interviews-panels','business','clara',['Mateus Faria'],['liderazgo','practica'],T('Entrevista: liderazgo empresarial','Entrevista: liderança empresarial','Interview: business leadership')],
    ['i4','interviews-panels','education','lucia',['Amarilis Vellon','Clara María'],['crecimiento','comunidad'],T('Panel: educar con mentoría','Painel: educar com mentoria','Panel: educating with mentoring')],
    ['i5','interviews-panels','family','mateus',['Amarilis Vellon'],['familia','valores'],T('Entrevista: la familia como primera escuela','Entrevista: a família como primeira escola','Interview: the family as the first school')]
  ];

  var videos = V.map(function (r) {
    return {
      id: r[0], section: r[1], category: r[2], author: r[3], others: r[4], tags: r[5], title: r[6], featured: !!r[7],
      description: DESC[r[1]], duration: 107, year: 2025, date: '2025-11-0' + (1 + (r[0].charCodeAt(1) % 8)),
      orig: 'es', video: VIDEO, hls: HLS, thumb: THUMB, slide: SLIDE(r[1]),
      dub: { pt: DEMO + 'audio-pt.mp3', en: DEMO + 'audio-en.mp3' },            // audio traducido (provisorio)
      subs: { es: DEMO + 'subs/es.vtt', pt: DEMO + 'subs/pt.vtt', en: DEMO + 'subs/en.vtt' } // subtítulos (provisorios)
    };
  });

  var REAL = [ // Storytelling reales (Bunny Stream). [autor, guid, segundos, título]
    ["amarilis", 'ea117928-13c6-4698-b2f9-eb491bc44017', 107, "El valor de la Familia"],
    ["alejandro-motta", '2374aeee-183e-4ca8-8a75-15c680676e4a', 332, "Propósito"],
    ["aldo-tomas-pinero", 'ec1b38e6-413d-4607-809a-2c87d41782b4', 324, "Storytelling – Aldo Tomás Piñero"],
    ["alvaro-yair-pinilla-silva", 'e34f20b7-c6a4-4195-88f7-ea3c62734d59', 286, "Storytelling – Alvaro Yair Pinilla Silva"],
    ["daniel-rosales", '96e40a18-880e-44e2-9ba2-e0fc914bf8e5', 232, "Storytelling – Daniel Rosales"],
    ["ana-maria-bonotti", '2727288c-5ddc-4949-9608-7b7f8d97601d', 545, "Storytelling – Ana Maria Bonotti"],
    ["adriana-gomez", '3af54f8a-5b29-4f62-8654-37b246dd8e4b', 508, "Storytelling – Adriana Gomez"],
    ["angeles-diaz", '56b4c480-887e-4289-9d01-9ca20431e64f', 461, "Storytelling – Angeles Diaz"],
    ["angela-kohler", '256d8199-b670-4e74-96b7-c17de83281df', 544, "Storytelling – Angela Kohler"],
    ["cristina-mejias", '1814d6a7-3283-48e6-aa1b-e585f101f429', 858, "Storytelling – Cristina Mejias"],
    ["barreto-navarro-zoila-beatriz", '80d8e1c0-8da3-4e7b-b946-df1fe573fae7', 776, "Storytelling – Barreto Navarro Zoila Beatriz"],
    ["diego-repetto", 'ad81c2d3-5fe5-42e1-81b1-b4e9b4dddde7', 230, "Madrugando un Sueño sobre Ruedas"],
    ["dora-rozo", '950ee19e-58b8-4b66-b467-f969d99a1c77', 61, "Storytelling – Dora Rozo"],
    ["edison-guerrero-quintero", '024b6451-337c-4c9d-b312-0c813e1522ee', 579, "Storytelling – Edison Guerrero Quintero"],
    ["elita-salinas", '0b44ac4e-d44c-4736-b1e1-cce4bce59be5', 509, "Storytelling – Elita Salinas"],
    ["gabriel-vazquez", 'b9fd8182-9914-4beb-b7da-6c205937cd93', 234, "Mi Regalo de Reyes"],
    ["daniel-tigani", 'd1a37235-3131-41c9-8912-9abfe6bf8aae', 178, "Storytelling – Daniel Tigani"],
    ["blanca-llontop", '0879d5dd-688b-4d54-bd73-7e3fcc6f5cef', 451, "Storytelling – Blanca Llontop"],
    ["daniela-algeri", 'e8e83d14-c752-4704-b284-1bf74baad85d', 316, "Storytelling – Daniela Algeri"],
    ["gina-lisset-garcia-cardoza", '297a2102-d0e4-4a0e-9db5-7091783a140d', 651, "Storytelling – Gina Lisset García Cardoza"],
    ["margarita-gibson", 'c6e31bf2-5683-43b4-a14d-c2294e7f5181', 860, "Storytelling – Margarita Gibson"],
    ["victoria-roldan", 'f97c88e1-a9b7-41c7-b629-1427a931f310', 360, "Storytelling – Victoria Roldan"],
    ["parra-nehemias", 'e96cdb5f-3a83-4a9e-b761-5a6f2da9b54b', 601, "Storytelling – Parra Nehemias"],
    ["odar-alexander-carranza-reyes", 'ed8386e4-3425-42f1-98d3-03da05a82954', 443, "Storytelling – Odar Alexander Carranza Reyes"],
    ["maria-segunda", '7c185d24-bd2d-44b4-bbf4-120b58c2794f', 160, "Mentora de Familias con integrante con enfermedad terminal"],
    ["mauricio-louzada", 'f9ed632e-384c-4cbe-9738-c3abab15252f', 146, "Storytelling – Mauricio Louzada"],
    ["ivan-lavin-lopez", 'd5388394-0cb3-4da3-a71f-22b4ab045724', 1065, "Storytelling – Ivan Lavin Lopez"],
    ["javier-garcia-delgado", '584f7b7d-a253-4489-827f-75f6c676b7e5', 463, "Storytelling – Javier Garcia Delgado"],
    ["karin-veronica-espinoza", 'fc58c4bc-8a65-40b1-b66c-2578c855e7fc', 471, "Storytelling – Karin Verónica Espinoza"],
    ["kleber-rodrigues", '4fc39c56-79b2-4d4c-bc11-affaa0ec8452', 506, "Storytelling – Kleber Rodrigues"],
    ["laura-duda", '194092e1-41a0-42b3-896b-99220874b582', 587, "Storytelling – Laura Duda"],
    ["laura-vaccarini", '3e1d8602-1bca-4ae8-80e2-79bb0299e9b6', 440, "Storytelling – Laura Vaccarini"],
    ["marcela-barbita", 'd690d2b9-8d37-44e4-b546-00241b2b7c35', 225, "Storytelling – Marcela Barbita"],
    ["maria-segunda", '7364c8dd-3bb8-4417-8df1-f693beaa22fd', 182, "Mentora de Familias Monoparentales y Homosentimentales"],
    ["rafael-guillermo-hernandez-molina", 'cc632e29-515e-4d6d-85b4-aa871973c25e', 492, "Storytelling – Rafael Guillermo Hernández Molina"],
    ["rodolfo-cremer", '0f9b018b-da32-42a7-94e1-0bbb8b4b5522', 286, "Storytelling – Rodolfo Cremer"],
    ["rosario-socualaya", '46bdae20-9984-4835-bd30-bf5823109375', 602, "Storytelling – Rosario Socualaya"],
    ["walter-teran-chiriboga", 'ee99e363-65e7-4714-a07f-2c34da4f900a', 400, "Storytelling – Walter Teran Chiriboga"],
    ["yesenia-ysabel-cabrera-aspajo", '5324326f-1bb6-4ae9-8432-ba07a7cc2537', 575, "Storytelling – Yesenia Ysabel Cabrera Aspajo"],
    ["mauricio-souto", '93d5b4e4-731f-4331-85e4-4b0907afead6', 248, "Storytelling – Mauricio Souto"],
  ];

  // Videos con subtítulos ya cargados en Bunny (captions ES/PT/EN en el CDN)
  var SUBBED = [
    'ea117928-13c6-4698-b2f9-eb491bc44017',
    '2374aeee-183e-4ca8-8a75-15c680676e4a',
    'ec1b38e6-413d-4607-809a-2c87d41782b4',
    'e34f20b7-c6a4-4195-88f7-ea3c62734d59',
    '96e40a18-880e-44e2-9ba2-e0fc914bf8e5',
    '2727288c-5ddc-4949-9608-7b7f8d97601d',
    '3af54f8a-5b29-4f62-8654-37b246dd8e4b',
    '56b4c480-887e-4289-9d01-9ca20431e64f',
    '256d8199-b670-4e74-96b7-c17de83281df',
    '1814d6a7-3283-48e6-aa1b-e585f101f429',
    '80d8e1c0-8da3-4e7b-b946-df1fe573fae7',
    'ad81c2d3-5fe5-42e1-81b1-b4e9b4dddde7',
    '950ee19e-58b8-4b66-b467-f969d99a1c77',
    '024b6451-337c-4c9d-b312-0c813e1522ee',
    '0b44ac4e-d44c-4736-b1e1-cce4bce59be5',
    'b9fd8182-9914-4beb-b7da-6c205937cd93',
    'd1a37235-3131-41c9-8912-9abfe6bf8aae',
    '0879d5dd-688b-4d54-bd73-7e3fcc6f5cef',
    'e8e83d14-c752-4704-b284-1bf74baad85d',
    '297a2102-d0e4-4a0e-9db5-7091783a140d'];
  var CDN = 'https://vz-6a7af8bf-f99.b-cdn.net/';
  REAL.forEach(function (r, i) {
    var cap = SUBBED.indexOf(r[1]) >= 0 ? { es: CDN + r[1] + '/captions/ES.vtt', pt: CDN + r[1] + '/captions/PT.vtt', en: CDN + r[1] + '/captions/EN.vtt' } : {};
    videos.push({
      id: 'st' + (i + 1), section: 'storytelling', category: 'human', author: r[0], others: [], tags: [], title: T(r[3], r[3], r[3]), featured: i === 0,
      description: DESC.storytelling, duration: r[2], year: 2025, date: '2025-11-' + (10 + (i % 18)),
      orig: 'es', slide: SLIDE('storytelling'), video: '', hls: 'https://vz-6a7af8bf-f99.b-cdn.net/' + r[1] + '/playlist.m3u8', thumb: 'https://vz-6a7af8bf-f99.b-cdn.net/' + r[1] + '/thumbnail.jpg',
      dub: {}, subs: cap
    });
  });

  window.RGM_CATALOG = { sections: SECTIONS, categories: CATEGORIES, authors: AUTHORS, videos: videos };
})();
