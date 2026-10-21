(function(){
  var ZAP = "5541996585383";
  var CHAVE = "edv-cookies";
  function guarda(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }
  function le(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }

  // Menu no celular
  var bt = document.querySelector(".abre-menu"), menu = document.getElementById("menu");
  if(bt && menu){
    bt.addEventListener("click", function(){
      var aberto = menu.classList.toggle("aberto");
      bt.setAttribute("aria-expanded", aberto ? "true" : "false");
      bt.textContent = aberto ? "Fechar" : "Menu";
    });
    menu.addEventListener("click", function(e){
      if(e.target.closest("a")){ menu.classList.remove("aberto"); bt.setAttribute("aria-expanded","false"); bt.textContent = "Menu"; }
    });
  }

  document.querySelectorAll("[data-ano]").forEach(function(el){ el.textContent = new Date().getFullYear(); });

  // Abas de modalidade
  document.querySelectorAll("[data-abas]").forEach(function(grupo){
    var botoes = grupo.querySelectorAll("[role=tab]");
    botoes.forEach(function(b){
      b.addEventListener("click", function(){
        botoes.forEach(function(o){
          var ativo = o === b;
          o.setAttribute("aria-selected", ativo ? "true" : "false");
          o.tabIndex = ativo ? 0 : -1;
          document.getElementById(o.getAttribute("aria-controls")).hidden = !ativo;
        });
      });
      b.addEventListener("keydown", function(e){
        if(e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        var lista = Array.prototype.slice.call(botoes), i = lista.indexOf(b);
        var prox = lista[(i + (e.key === "ArrowRight" ? 1 : lista.length - 1)) % lista.length];
        prox.focus(); prox.click();
      });
    });
  });

  // Fotos em tela cheia
  var fotos = Array.prototype.slice.call(document.querySelectorAll("[data-foto]"));
  if(fotos.length){
    var caixa = document.createElement("div");
    caixa.className = "caixa"; caixa.hidden = true;
    caixa.setAttribute("role","dialog"); caixa.setAttribute("aria-modal","true"); caixa.setAttribute("aria-label","Fotos da casa");
    caixa.innerHTML = '<button type="button" class="ant" aria-label="Foto anterior">&#8249;</button><img alt=""><button type="button" class="prox" aria-label="Próxima foto">&#8250;</button><button type="button" class="fecha" aria-label="Fechar">&#215;</button>';
    document.body.appendChild(caixa);
    var img = caixa.querySelector("img"), lista = [], pos = 0, volta = null;
    function mostra(i){ pos = (i + lista.length) % lista.length; img.src = lista[pos].src; img.alt = lista[pos].alt; }
    function fecha(){ caixa.hidden = true; if(volta) volta.focus(); }
    fotos.forEach(function(b){
      b.addEventListener("click", function(){
        var grupo = b.getAttribute("data-foto");
        lista = []; var vistos = {};
        fotos.forEach(function(o){
          if(o.getAttribute("data-foto") !== grupo) return;
          var im = o.querySelector("img");
          if(vistos[im.getAttribute("src")]) return;
          vistos[im.getAttribute("src")] = 1;
          lista.push({src: im.getAttribute("src"), alt: im.alt});
        });
        var src = b.querySelector("img").getAttribute("src");
        var i = 0; lista.forEach(function(f, k){ if(f.src === src) i = k; });
        volta = b; mostra(i); caixa.hidden = false; caixa.querySelector(".fecha").focus();
      });
    });
    caixa.querySelector(".ant").addEventListener("click", function(){ mostra(pos - 1); });
    caixa.querySelector(".prox").addEventListener("click", function(){ mostra(pos + 1); });
    caixa.querySelector(".fecha").addEventListener("click", fecha);
    caixa.addEventListener("click", function(e){ if(e.target === caixa) fecha(); });
    document.addEventListener("keydown", function(e){
      if(caixa.hidden) return;
      if(e.key === "Escape") fecha();
      if(e.key === "ArrowRight") mostra(pos + 1);
      if(e.key === "ArrowLeft") mostra(pos - 1);
    });
  }

  // Mapa só depois do consentimento
  function carregaMapas(){
    document.querySelectorAll("[data-mapa]").forEach(function(box){
      if(box.querySelector("iframe")) return;
      var f = document.createElement("iframe");
      f.src = box.getAttribute("data-mapa"); f.loading = "lazy";
      f.title = "Mapa do Lar Excelência da Vida"; f.referrerPolicy = "no-referrer-when-downgrade";
      box.innerHTML = ""; box.appendChild(f);
    });
  }
  var aviso = document.querySelector(".cookies");
  var escolha = le(CHAVE);
  if(escolha === "aceito") carregaMapas();
  if(aviso && !escolha) aviso.hidden = false;
  document.querySelectorAll("[data-cookies]").forEach(function(b){
    b.addEventListener("click", function(){
      var v = b.getAttribute("data-cookies"); guarda(CHAVE, v);
      if(aviso){ aviso.hidden = true; aviso.remove(); }
      if(v === "aceito") carregaMapas();
    });
  });
  document.querySelectorAll("[data-ver-mapa]").forEach(function(b){
    b.addEventListener("click", function(){ guarda(CHAVE, "aceito"); if(aviso){ aviso.hidden = true; aviso.remove(); } carregaMapas(); });
  });

  // Formulários viram mensagem no WhatsApp
  document.querySelectorAll("form[data-zap]").forEach(function(form){
    form.addEventListener("submit", function(e){
      e.preventDefault();
      if(!form.reportValidity()) return;
      var linhas = [form.getAttribute("data-zap")];
      form.querySelectorAll("[data-campo]").forEach(function(c){
        var v = "";
        if(c.tagName === "FIELDSET"){
          var marcado = c.querySelector("input:checked"); v = marcado ? marcado.value : "";
        } else { v = (c.value || "").trim(); }
        if(v) linhas.push(c.getAttribute("data-campo") + ": " + v);
      });
      var extra = form.getAttribute("data-final");
      if(extra) linhas.push(extra);
      var url = "https://wa.me/" + ZAP + "?text=" + encodeURIComponent(linhas.join("\n"));
      var w = window.open(url, "_blank");
      if(!w) window.location.href = url;
    });
  });
})();
