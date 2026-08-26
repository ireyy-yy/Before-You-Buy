(function(){
  "use strict";

  var districtVillageMap = {
    raigad:  { text: "Village Devarwadi, Taluka Karjat, District Raigad, Maharashtra" },
    pune:    { text: "Village Wadgaon, Taluka Mulshi, District Pune, Maharashtra" },
    nashik:  { text: "Village Igatpuri, Taluka Igatpuri, District Nashik, Maharashtra" },
    thane:   { text: "Village Shahapur, Taluka Shahapur, District Thane, Maharashtra" },
    satara:  { text: "Village Mahabaleshwar, Taluka Mahabaleshwar, District Satara, Maharashtra" }
  };

  var mapStyles = {
    satellite: { title: "Satellite View (ISRO Bhuvan)", tag: "Plot boundary (approx.)" },
    landuse:   { title: "Land Use Map (ISRO Bhuvan)",   tag: "Agricultural zone" },
    roadmap:   { title: "Road Map View",                 tag: "Approach road" },
    hybrid:    { title: "Hybrid View (ISRO Bhuvan)",     tag: "Plot boundary (approx.)" }
  };

  function $(sel, ctx){ return (ctx||document).querySelector(sel); }
  function $all(sel, ctx){ return Array.prototype.slice.call((ctx||document).querySelectorAll(sel)); }

  var main = $("#main-content");
  var homeView = $("#home-view");
  var resultsView = $("#results-view");
  var aboutView = $("#about-view");
  var navLinks = $all(".main-nav a");

  function setActiveNav(key){
    navLinks.forEach(function(a){
      a.classList.toggle("active", a.dataset.nav === key);
    });
  }

  function showView(name){
    homeView.classList.toggle("active", name === "home");
    resultsView.classList.toggle("active", name === "results");
    aboutView.classList.toggle("active", name === "about");
    window.scrollTo({ top: 0, behavior: "auto" });
    main.focus({ preventScroll: true });
  }

  function formatTimestamp(d){
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var hours = d.getHours();
    var mins = d.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    var h12 = hours % 12; if(h12 === 0) h12 = 12;
    var mm = mins < 10 ? "0"+mins : mins;
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear() + ", " + h12 + ":" + mm + " " + ampm;
  }

  // ---- Nav clicks ----
  navLinks.forEach(function(a){
    a.addEventListener("click", function(e){
      e.preventDefault();
      var key = a.dataset.nav;
      $("#main-nav").classList.remove("open");
      if(key === "home"){
        setActiveNav("home");
        showView("home");
      } else if(key === "results"){
        setActiveNav("results");
        showView("results");
      } else if(key === "checklist"){
        setActiveNav("results");
        showView("results");
        activateTab("checklist");
      } else if(key === "about"){
        setActiveNav("about");
        showView("about");
      }
    });
  });

  $("#nav-toggle").addEventListener("click", function(){
    var nav = $("#main-nav");
    var open = nav.classList.toggle("open");
    this.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // ---- Search form submit ----
  $("#search-form").addEventListener("submit", function(e){
    e.preventDefault();
    var district = $("#district-select").value || "raigad";
    var info = districtVillageMap[district] || districtVillageMap.raigad;
    $("#location-title").textContent = info.text;
    $("#location-timestamp").textContent = "Searched on " + formatTimestamp(new Date());
    setActiveNav("results");
    activateTab("overview");
    showView("results");
  });

  $("#back-to-search").addEventListener("click", function(){
    setActiveNav("home");
    showView("home");
  });

  // ---- Tabs ----
  var tabButtons = $all(".tab-btn");
  var tabPanels = {
    overview: $("#panel-overview"),
    landuse: $("#panel-landuse"),
    classification: $("#panel-classification"),
    why: $("#panel-why"),
    checklist: $("#panel-checklist")
  };

  function activateTab(name){
    tabButtons.forEach(function(btn){
      btn.setAttribute("aria-selected", btn.dataset.tab === name ? "true" : "false");
    });
    Object.keys(tabPanels).forEach(function(key){
      tabPanels[key].classList.toggle("active", key === name);
    });
  }

  tabButtons.forEach(function(btn){
    btn.addEventListener("click", function(){ activateTab(btn.dataset.tab); });
  });

  $all("[data-goto-tab]").forEach(function(btn){
    btn.addEventListener("click", function(){ activateTab(btn.dataset.gotoTab); });
  });

  // ---- Map type selector ----
  var mapViewport = $("#map-viewport");
  var mapTypeButtons = $all(".map-type-btn");
  mapTypeButtons.forEach(function(btn){
    btn.addEventListener("click", function(){
      mapTypeButtons.forEach(function(b){ b.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", "true");
      var type = btn.dataset.mapType;
      mapViewport.classList.remove("map-satellite","map-landuse","map-roadmap","map-hybrid");
      if(type !== "satellite"){ mapViewport.classList.add("map-" + type); }
      var style = mapStyles[type];
      $("#map-title").textContent = style.title;
      $("#map-label-tag").textContent = style.tag;
    });
  });

  // ---- Checklist progress ----
  var checklistBoxes = $all("#checklist-items input[type=checkbox]");
  function updateProgress(){
    var total = checklistBoxes.length;
    var done = checklistBoxes.filter(function(c){ return c.checked; }).length;
    $("#progress-fill").style.width = (total ? (done/total*100) : 0) + "%";
    $("#progress-text").textContent = done + " of " + total + " completed";
  }
  checklistBoxes.forEach(function(box){
    box.addEventListener("change", function(){
      box.closest(".check-item").classList.toggle("done", box.checked);
      updateProgress();
    });
  });
  updateProgress();

  // ---- Accessibility panel ----
  var a11yBtn = $("#a11y-toggle-btn");
  var a11yPanel = $("#a11y-panel");
  var a11yClose = $("#a11y-close");
  var a11yReset = $("#a11y-reset");
  var textButtons = $all(".a11y-chip");
  var contrastToggle = $("#toggle-contrast");
  var motionToggle = $("#toggle-motion");
  var underlineToggle = $("#toggle-underline");

  function openA11yPanel(){
    a11yPanel.removeAttribute("hidden");
    a11yBtn.setAttribute("aria-expanded", "true");
  }
  function closeA11yPanel(){
    a11yPanel.setAttribute("hidden", "");
    a11yBtn.setAttribute("aria-expanded", "false");
  }

  a11yBtn.addEventListener("click", function(){
    if(a11yPanel.hasAttribute("hidden")){ openA11yPanel(); } else { closeA11yPanel(); }
  });
  a11yClose.addEventListener("click", closeA11yPanel);

  document.addEventListener("click", function(e){
    if(!a11yPanel.hasAttribute("hidden") && !a11yPanel.contains(e.target) && e.target !== a11yBtn && !a11yBtn.contains(e.target)){
      closeA11yPanel();
    }
  });
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape" && !a11yPanel.hasAttribute("hidden")){
      closeA11yPanel();
      a11yBtn.focus();
    }
  });

  textButtons.forEach(function(btn){
    btn.addEventListener("click", function(){
      textButtons.forEach(function(b){ b.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", "true");
      document.body.classList.remove("a11y-text-large", "a11y-text-xl");
      var size = btn.dataset.textSize;
      if(size === "large"){ document.body.classList.add("a11y-text-large"); }
      if(size === "xl"){ document.body.classList.add("a11y-text-xl"); }
    });
  });

  contrastToggle.addEventListener("change", function(){
    document.body.classList.toggle("a11y-contrast", contrastToggle.checked);
  });
  motionToggle.addEventListener("change", function(){
    document.body.classList.toggle("a11y-reduce-motion", motionToggle.checked);
  });
  underlineToggle.addEventListener("change", function(){
    document.body.classList.toggle("a11y-underline-links", underlineToggle.checked);
  });

  a11yReset.addEventListener("click", function(){
    document.body.classList.remove("a11y-text-large", "a11y-text-xl", "a11y-contrast", "a11y-reduce-motion", "a11y-underline-links");
    textButtons.forEach(function(b){ b.setAttribute("aria-pressed", b.dataset.textSize === "normal" ? "true" : "false"); });
    contrastToggle.checked = false;
    motionToggle.checked = false;
    underlineToggle.checked = false;
  });

})();
