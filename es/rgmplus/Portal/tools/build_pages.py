#!/usr/bin/env python3
"""Genera las páginas (una carpeta con index.html por URL) del portal RGM+.
Uso:  python3 build_pages.py            (desde cualquier carpeta)
Las secciones y categorías salen de la lista de abajo (mismas rutas que js/catalog.js).
Todas las páginas cargan el mismo js/app.js; sólo cambia <body data-page data-key data-base>."""
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SECTIONS = ['Presentations', 'MasterClass', 'Interviews-Panels', 'Storytelling']
CATEGORIES = ['Human', 'Business', 'Education', 'Sport', 'Technology', 'Public', 'Family', 'Culture', 'Health', 'Environment', 'Workers', 'Skills']
TPL = """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>RGM+ · {title}</title>
<meta name="theme-color" content="#46006c">
<link rel="icon" href="{b}assets/plus.svg" type="image/svg+xml">
<link rel="stylesheet" href="{b}css/portal.css">
</head>
<body data-page="{page}" data-key="{key}" data-base="{b}">
<div id="app"></div>
<noscript><p style="padding:24px">RGM+ necesita JavaScript para funcionar.</p></noscript>
<script src="{b}js/config.js"></script>
<script src="{b}js/i18n.js"></script>
<script src="{b}js/catalog.js"></script>
<script src="{b}js/player.js"></script>
<script src="{b}js/app.js"></script>
</body>
</html>
"""
def write(folder, **kw):
    d = os.path.normpath(os.path.join(ROOT, folder)); os.makedirs(d, exist_ok=True)
    kw['b'] = '../' * (folder.count('/') + 1) if folder else ''
    open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(TPL.format(**kw))
write('', title='Un camino de aprendizaje continuo', page='home', key='')
for s in SECTIONS: write(s, title=s, page='section', key=s.lower())
for c in CATEGORIES: write(c, title=c, page='category', key=c.lower())
write('Watch', title='Video', page='watch', key='')
write('Author', title='Autor', page='author', key='')
write('Collection', title='Colección', page='collection', key='')
write('FAQ', title='Preguntas Frecuentes', page='faq', key='')
print('páginas generadas:', 1 + len(SECTIONS) + len(CATEGORIES) + 4)
