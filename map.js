// Saxum Industries: "Where we work" dotted map with animated export routes.
// Coastlines are deliberately simplified; the map is schematic.
(function () {
  const canvas = document.getElementById('world');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Simplified land outlines as [lon, lat] rings
  const LAND = [
    // Africa
    [[-17,21],[-16,28],[-10,30],[-6,35.8],[10,37],[11,33],[20,31],[25,31.5],[32,31.3],[34,28],[39,20],[43,12.5],[51,11.8],[48,5],[41,-2],[40,-10],[40.5,-15],[35,-22],[33,-26],[32.5,-29],[28,-33],[20,-34.8],[18,-32],[15,-27],[13.5,-21],[11.8,-17],[12.5,-13],[13.5,-9],[12,-5],[9,-1],[9.5,3.5],[6,4.3],[0,5.5],[-4,5.2],[-8,4.4],[-13,8],[-15,11],[-17,14.7]],
    // Madagascar
    [[44,-25],[47,-25],[50,-15],[49.5,-12],[44,-17]],
    // Arabian Peninsula
    [[35,28],[39,22],[43,13],[45,12.7],[52,16],[57,19],[59.8,22.5],[56.5,26],[51.5,24],[50,26.5],[48,29.5],[44,33],[38,33],[35,32]],
    // Europe
    [[-9.5,36],[-9,43],[-2,43.5],[-4.5,48.5],[2,51],[8,54],[10,57.5],[5,58],[5,62],[15,69],[25,71],[40,67],[45,50],[40,45],[36,45],[28,41],[26,40],[23,36.5],[20,40],[18,40],[12,44],[16,38],[12,38],[8,44],[3,43],[0,39],[-2,36.7],[-6,36]],
    // Great Britain
    [[-5.5,50],[1.5,51],[1.7,52.8],[-0.5,54],[-2,55.8],[-1.8,57.5],[-3,58.6],[-5,58.6],[-6,56.5],[-5,54.8],[-3,53.4],[-5,51.7]],
    // Asia
    [[36,36],[44,37],[48,30],[50,30],[57,27],[62,25],[67,24.5],[70,21],[73,17],[76,9],[77.5,8],[80,13],[80.5,16],[87,21.5],[90,22],[92,21],[94,17],[97,16.5],[98,8],[100.5,4],[103.5,1.5],[104,10],[106,9],[109,12],[108,16],[106.5,20],[108,21.5],[111,21.5],[114,22.5],[117,24],[120,27],[122,31],[120.5,34],[122,37],[118,38.5],[121,40],[125,40],[126,37],[129.5,35],[129,38],[130,42.5],[135,43.5],[141,48],[142,53],[141,59],[150,60],[160,61],[165,62],[178,65],[180,69],[150,72],[130,71],[110,77],[80,73],[66,70],[55,68],[45,66],[40,64],[40,60],[48,52],[50,47],[52,42],[54,38],[48,40],[42,41.5],[36,41]],
    // Sri Lanka
    [[80,6],[82,7.5],[81.5,9.5],[80,9.5]],
    // Japan
    [[130,31],[132,34],[136,34],[140,35],[141,38],[141.5,41],[140,41.5],[139.5,38],[136,37],[132,35.5]],
    [[140,42],[144,43],[145.5,43.5],[143,45],[141.5,45.5],[140,43.5]],
    // Indonesia, Philippines, New Guinea
    [[95,5.5],[98,4],[104,-1],[106,-6],[103,-5],[100,-1],[96,3]],
    [[105.5,-6.8],[114.5,-7.5],[114,-8.7],[106,-7.5]],
    [[109,2],[110,-2],[116,-4],[119,1],[117,7],[115,5],[111,2]],
    [[120,18.5],[122.5,18.5],[124,13],[126,7],[125,6],[122,7],[121,12],[120,14.5]],
    [[131,-1],[141,-2.5],[148,-6],[150,-10.5],[141,-9],[137,-5],[132,-4]],
    // Australia
    [[114,-22],[114,-34],[118,-35],[124,-33.7],[131,-31.5],[135,-34.5],[138,-35],[140,-38],[146,-39],[150,-37.5],[153,-29],[153,-25],[146,-19],[145.5,-15],[142.5,-10.7],[141.5,-13],[141,-17],[136,-15.5],[137,-12],[132,-11.5],[129,-15],[126,-14],[122,-17.5]],
    // South America
    [[-80,0],[-80.5,-6],[-76,-14],[-70.5,-18],[-70,-26],[-71.5,-30],[-73.5,-37],[-73.5,-45],[-75,-50],[-72,-53.5],[-68,-55],[-65,-55],[-68,-52],[-66,-48],[-67.5,-46],[-65,-42],[-62,-39],[-57.5,-38],[-57,-36],[-54,-34.5],[-50,-31],[-48.5,-28],[-48,-25.5],[-44,-23],[-41,-22],[-39,-17.5],[-39,-13],[-35,-9],[-35,-5.5],[-38,-3.5],[-44,-2.5],[-50,0],[-51,4],[-54,5.8],[-57,6],[-61,8.5],[-64,10.5],[-71,12.5],[-72,11],[-75.5,10.5],[-77.5,8],[-78,7],[-77.5,3.5],[-79,1.5]],
    // Central and North America (southern part)
    [[-77.5,8],[-80,7.5],[-83,8.5],[-84,11],[-87.5,13],[-91,14],[-94.5,16],[-96.5,15.7],[-105,19.5],[-106,23],[-110,24],[-112,29],[-114.8,31.5],[-117,32.5],[-120.5,34.5],[-124,40],[-124.5,48],[-123,49],[-95,49],[-83,46],[-82.5,42],[-70,43],[-70,41.5],[-74,40.5],[-76,37],[-75.5,35.3],[-81,31.5],[-80,27],[-80.5,25.3],[-82,26.5],[-83,29],[-89,30],[-94,29.5],[-97.5,26],[-97.5,22],[-96,19],[-94.5,18.2],[-91.5,18.5],[-90.5,21],[-87,21.5],[-88,18],[-88.5,16],[-84,15.8],[-83.3,15],[-83.5,10.8],[-81.5,9],[-79,9.5]]
  ];

  // Sourcing countries, simplified outlines for highlighting
  const FOCUS = [
    [[2.7,6.4],[4.5,6.3],[5.9,4.3],[7,4.4],[8.5,4.5],[9.5,6],[11.5,6.8],[12.5,8.5],[13.6,10.5],[14.6,12.2],[13.6,13.7],[12.3,13.1],[10.6,13.3],[9,12.8],[7.8,13.3],[6.3,13.7],[4.1,13.5],[3.6,12],[3.6,10.3],[2.7,9]],
    [[11.75,-17.25],[13.5,-17],[18.45,-17.39],[21,-18],[23.3,-17.55],[25.26,-17.78],[23.2,-17.9],[21,-18.3],[20.99,-22],[20,-22],[20,-28.4],[18.2,-28.9],[16.45,-28.6],[15.2,-27],[14.5,-23],[13.4,-20.8],[12,-18.4]],
    [[25.24,-17.8],[27,-17],[29,-15.9],[30.4,-15.63],[32,-16.4],[32.9,-16.7],[33,-18.6],[32.7,-19.5],[32.5,-20.6],[31.3,-22.4],[29.4,-22.2],[28,-21.6],[27,-20],[25.7,-18.9]],
    [[16.5,-28.6],[18.2,-28.9],[20,-28.4],[20,-24.8],[22,-25.8],[25.6,-25.4],[27,-23.6],[29.4,-22.2],[31.3,-22.4],[32,-24.5],[32.9,-26.9],[32.4,-28.6],[31,-29.9],[30,-31.3],[28,-33],[25.6,-34],[22,-34.2],[20,-34.8],[18.4,-34.2],[18.2,-32],[17.2,-30]],
    [[22,-13],[22,-16.2],[23.5,-17.6],[25.3,-17.8],[26.5,-17.6],[28,-16.5],[29,-15.9],[30.4,-15.6],[33,-14],[33.2,-12.5],[33.5,-10.5],[31,-8.6],[29,-8.3],[28.6,-9],[28.4,-11.8],[29.6,-13.3],[27.2,-12],[25.4,-11.2],[24,-11],[24,-13]]
  ];
  const HQ = { ll: [13.23, -8.84], label: "Head office", sub: "Luanda, Angola", to: [1, -3] };
  const SOURCES = [
    { ll: [8.0, 9.5], label: "Nigeria", to: [-6, 17] },
    { ll: [15.6, -19.4], label: "Namibia", to: [4, -30] },
    { ll: [27.0, -14.0], label: "Zambia", to: [27, -3] },
    { ll: [29.8, -19.2], label: "Zimbabwe", to: [45, -8] },
    { ll: [24.5, -29.5], label: "South Africa", to: [24.5, -40] }
  ];
  // Export routes: from southern African ports to target destinations
  const ROUTES = [
    { from: [14.5, -22.9], to: [-46.3, -23.9], label: "Brazil", bend: [0, 14] },
    { from: [31.0, -29.9], to: [101.4, 3.0], label: "Malaysia", bend: [4, -4] },
    { from: [34.84, -19.83], to: [106.7, 10.8], label: "Vietnam", bend: [6, -12] },
    { from: [34.84, -19.83], to: [121.5, 31.2], label: "China", bend: [12, -14] }
  ];

  function inside(lon, lat, ring) {
    let c = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }

  const bg = document.createElement('canvas');
  const bctx = bg.getContext('2d');
  let W = 0, H = 0, d = 1, view, raf = 0, visible = true, t0 = performance.now();

  function setView() {
    const narrow = W < 640;
    view = narrow ? { lon0: -60, lon1: 130, lat0: 42, lat1: -42 } : { lon0: -95, lon1: 150, lat0: 52, lat1: -46 };
  }
  const P = ([lon, lat]) => [(lon - view.lon0) / (view.lon1 - view.lon0) * W, (view.lat0 - lat) / (view.lat0 - view.lat1) * H];
  const font = (wt, px) => `${wt} ${px}px "Rethink Sans", "Helvetica Neue", Arial, sans-serif`;

  function background() {
    bctx.setTransform(d, 0, 0, d, 0, 0);
    bctx.clearRect(0, 0, W, H);
    const step = W < 640 ? 2.2 : 1.6;
    const r = Math.max(1, (W / ((view.lon1 - view.lon0) / step)) * 0.28);
    for (let lat = view.lat0; lat >= view.lat1; lat -= step) {
      for (let lon = view.lon0; lon <= view.lon1; lon += step) {
        if (!LAND.some(ring => inside(lon, lat, ring))) continue;
        const [x, y] = P([lon, lat]);
        const south = FOCUS.some(ring => inside(lon, lat, ring));
        bctx.fillStyle = south ? '#555555' : '#C4C4C4';
        bctx.beginPath(); bctx.arc(x, y, south ? r * 1.15 : r, 0, 7); bctx.fill();
      }
    }
    // coordination line: head office to sourcing region
    const a = P(HQ.ll), b = P([26, -20]);
    bctx.save(); bctx.strokeStyle = '#8A8A8A'; bctx.lineWidth = 1.2; bctx.setLineDash([3, 5]);
    bctx.beginPath(); bctx.moveTo(a[0], a[1]); bctx.quadraticCurveTo((a[0] + b[0]) / 2 + 30, (a[1] + b[1]) / 2, b[0], b[1]); bctx.stroke(); bctx.restore();
  }

  function curve(r) {
    const a = P(r.from), b = P(r.to);
    const m = P([(r.from[0] + r.to[0]) / 2 + r.bend[0], (r.from[1] + r.to[1]) / 2 + r.bend[1]]);
    return { a, b, m };
  }
  const at = (c, t) => {
    const u = 1 - t;
    return [u * u * c.a[0] + 2 * u * t * c.m[0] + t * t * c.b[0], u * u * c.a[1] + 2 * u * t * c.m[1] + t * t * c.b[1]];
  };

  function draw(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bg, 0, 0);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    const lab = W < 640 ? 11 : 13;

    // export routes: dashed trail that draws itself, with a moving shipment dot
    ROUTES.forEach((r, i) => {
      const c = curve(r);
      const cycle = 5, off = i * 1.3;
      const p = still ? 1 : Math.min(1, ((t + off) % cycle) / (cycle * 0.75));
      ctx.save();
      ctx.strokeStyle = '#171717'; ctx.lineWidth = 1.6; ctx.setLineDash([6, 6]); ctx.lineDashOffset = -t * 20;
      ctx.beginPath(); ctx.moveTo(c.a[0], c.a[1]);
      for (let s = 0.02; s <= p + 0.001; s += 0.02) { const q = at(c, Math.min(s, p)); ctx.lineTo(q[0], q[1]); }
      ctx.stroke(); ctx.restore();
      const q = at(c, p);
      ctx.fillStyle = '#171717'; ctx.beginPath(); ctx.arc(q[0], q[1], 4, 0, 7); ctx.fill();
      // destination
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#171717'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(c.b[0], c.b[1], 5, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#171717'; ctx.font = font(700, lab);
      ctx.textAlign = r.to[0] < 0 ? 'right' : 'left';
      ctx.fillText(r.label, c.b[0] + (r.to[0] < 0 ? -10 : 10), c.b[1] + 4 + (r.dy || 0));
    });

    // sourcing countries
    const pulse = still ? 0.5 : (t % 2) / 2;
    SOURCES.forEach(s => {
      const [x, y] = P(s.ll);
      ctx.strokeStyle = '#171717'; ctx.globalAlpha = 1 - pulse; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(x, y, 5 + pulse * 12, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill();
      ctx.fillStyle = '#171717'; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill();
      // label pulled out to a clear spot, with a thin pointer line
      const [lx, ly] = P(s.to);
      ctx.strokeStyle = "#8A8A8A"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lx, ly); ctx.stroke();
      ctx.font = font(600, lab); ctx.fillStyle = "#171717";
      ctx.textAlign = lx < x - 4 ? "right" : (lx > x + 4 ? "left" : "center");
      const dx = ctx.textAlign === "right" ? -5 : (ctx.textAlign === "left" ? 5 : 0);
      ctx.fillText(s.label, lx + dx, ly + (ctx.textAlign === "center" ? lab : 4));
    });

    // head office: black square with a pointer label out over the Atlantic
    const [hx, hy] = P(HQ.ll), [hlx, hly] = P(HQ.to), sz = 7;
    ctx.strokeStyle = "#8A8A8A"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hlx, hly); ctx.stroke();
    ctx.fillStyle = "#000"; ctx.fillRect(hx - sz, hy - sz, sz * 2, sz * 2);
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.strokeRect(hx - sz, hy - sz, sz * 2, sz * 2);
    ctx.textAlign = "right"; ctx.fillStyle = "#171717";
    ctx.font = font(700, lab); ctx.fillText(HQ.label, hlx - 6, hly - 2);
    ctx.font = font(500, lab - 1); ctx.fillStyle = "#6B6B6B"; ctx.fillText(HQ.sub, hlx - 6, hly + lab);
  }

  function resize() {
    d = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    if (!W || !H) return;
    canvas.width = bg.width = Math.round(W * d);
    canvas.height = bg.height = Math.round(H * d);
    setView(); background(); draw((performance.now() - t0) / 1000);
  }
  function loop(now) { draw((now - t0) / 1000); raf = visible ? requestAnimationFrame(loop) : 0; }

  resize();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
  if (still) return;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }).observe(canvas);
  }
  raf = requestAnimationFrame(loop);
})();
