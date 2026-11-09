/* Rastreio de página da Yzza. Guarda o caminho do visitante só na aba (sessionStorage).
   Nada vai para terceiros e não há cookie. Os dados só saem se a pessoa enviar o formulário. */
(function () {
  var CHAVE = 'yzza_rastreio';
  var NOMES = {
    'index': 'Home',
    'quem-somos': 'Quem somos',
    'crm': 'O CRM',
    'ia': 'IA de atendimento',
    'seguranca': 'Segurança',
    'como-comecamos': 'Como começamos',
    'contato': 'Contato',
    'privacidade': 'Privacidade'
  };
  function pagina() {
    var p = location.pathname.split('/').pop() || 'index.html';
    return p.replace(/\.html$/, '') || 'index';
  }
  function ler() {
    try { return JSON.parse(sessionStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; }
  }
  function gravar(o) {
    try { sessionStorage.setItem(CHAVE, JSON.stringify(o)); } catch (e) {}
  }
  var q = new URLSearchParams(location.search);
  var atual = pagina();
  var s = ler();
  if (!s.entrada) {
    s.entrada = atual;
    s.referrer = document.referrer || '';
    s.utm_source = q.get('utm_source') || '';
    s.utm_medium = q.get('utm_medium') || '';
    s.utm_campaign = q.get('utm_campaign') || '';
    s.caminho = [];
  }
  if (s.caminho[s.caminho.length - 1] !== atual) s.caminho.push(atual);
  if (s.caminho.length > 40) s.caminho = s.caminho.slice(-40);
  if (atual !== 'contato' && atual !== 'privacidade') s.ultimaProduto = atual;
  gravar(s);

  /* todo link para contato.html leva de qual página o clique saiu */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="contato.html"]');
    if (!a || /[?&]de=/.test(a.getAttribute('href'))) return;
    var h = a.getAttribute('href');
    a.setAttribute('href', h + (h.indexOf('?') > -1 ? '&' : '?') + 'de=' + encodeURIComponent(atual));
  }, true);

  function nome(p) { return NOMES[p] || p; }
  window.yzzaRastreio = function () {
    var st = ler();
    var de = new URLSearchParams(location.search).get('de') || st.ultimaProduto || '';
    return {
      pagina_origem: de,
      produto_interesse: de ? nome(de) : '',
      pagina_entrada: st.entrada || '',
      jornada: (st.caminho || []).join(' > '),
      referrer_inicial: st.referrer || '',
      utm_source: st.utm_source || '',
      utm_medium: st.utm_medium || '',
      utm_campaign: st.utm_campaign || ''
    };
  };
})();
