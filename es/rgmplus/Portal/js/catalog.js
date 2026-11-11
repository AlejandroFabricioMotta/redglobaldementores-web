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
  var THUMB = 'assets/img/valor-de-la-familia.jpg';
  var DEMO = 'assets/demo/';

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
    ['i5','interviews-panels','family','mateus',['Amarilis Vellon'],['familia','valores'],T('Entrevista: la familia como primera escuela','Entrevista: a família como primeira escola','Interview: the family as the first school')],

    ['s1','storytelling','human','clara',[],['historia','emotivo'],T('Mi historia como mentora','A minha história como mentora','My story as a mentor'),1],
    ['s2','storytelling','culture','mateus',[],['historia','comunidad'],T('Relatos de una comunidad','Relatos de uma comunidade','Stories from a community')],
    ['s3','storytelling','health','lucia',[],['emotivo','inspirador'],T('Aprender a cuidarse','Aprender a cuidar de si','Learning to look after yourself')],
    ['s4','storytelling','sport','david',[],['inspirador','crecimiento'],T('Lo que me enseñó el deporte','O que o desporto me ensinou','What sport taught me')],
    ['s5','storytelling','skills','amarilis',[],['historia','practica'],T('Cómo aprendí a escuchar','Como aprendi a ouvir','How I learned to listen')]
  ];

  var videos = V.map(function (r) {
    return {
      id: r[0], section: r[1], category: r[2], author: r[3], others: r[4], tags: r[5], title: r[6], featured: !!r[7],
      description: DESC[r[1]], duration: 107, year: 2025, date: '2025-11-0' + (1 + (r[0].charCodeAt(1) % 8)),
      orig: 'es', video: VIDEO, thumb: THUMB,
      dub: { pt: DEMO + 'audio-pt.mp3', en: DEMO + 'audio-en.mp3' },            // audio traducido (provisorio)
      subs: { es: DEMO + 'subs/es.vtt', pt: DEMO + 'subs/pt.vtt', en: DEMO + 'subs/en.vtt' } // subtítulos (provisorios)
    };
  });

  window.RGM_CATALOG = { sections: SECTIONS, categories: CATEGORIES, authors: AUTHORS, videos: videos };
})();
