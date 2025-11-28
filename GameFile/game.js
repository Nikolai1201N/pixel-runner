(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const helpBtn = document.getElementById('helpBtn');
  const helpModal = document.getElementById('helpModal');
  const closeHelp = document.getElementById('closeHelp');

  const GROUND_Y = 300;
  const MAX_JUMP_HEIGHT = 80;
  const COIN_MIN_Y = GROUND_Y - MAX_JUMP_HEIGHT;
  const COIN_MAX_Y = GROUND_Y;

  const keys = new Set();
  const hero = { x: 50, y: GROUND_Y, w: 32, h: 32, vy: 0, onGround: true };
  const world = { score:0, lives:3, hero, coins:[], spikes:[] };
  let last = performance.now();

  function spawn(){
    if (Math.random() < 0.03) {
      const minY = 220;
      const maxY = 300;
      const coinY = (minY + Math.random() * (maxY - minY)) | 0;
      world.coins.push({
        x: canvas.width + 20,
        y: coinY,
        w: 16,
        h: 16
      });
    }

    if (Math.random() < 0.02) {
      world.spikes.push({ x: canvas.width + 10, y: 308, w: 24, h: 24 });
    }
  }



  function aabb(a,b){ 
    return !(a.x+a.w<b.x || b.x+b.w<a.x || a.y+a.h<b.y || b.y+b.h<a.y);
  }

  function update(dt){
    const speed = 220;
    if (keys.has('ArrowRight')) hero.x += speed*dt;
    if (keys.has('ArrowLeft'))  hero.x -= speed*dt;
    if (keys.has('Space') && hero.onGround){ 
      hero.vy = -380; hero.onGround = false; 
    }
    hero.vy += 900*dt;
    hero.y += hero.vy*dt;
    if (hero.y >= 300){
      hero.y=300;
      hero.vy=0;
      hero.onGround=true; 
    }
    spawn();
    world.coins.forEach(c => c.x -= 200*dt);
    world.spikes.forEach(s => s.x -= 220 * dt);
    world.coins = world.coins.filter(c => !aabb(hero, c) ? true : (world.score++, false));

    world.spikes = world.spikes.filter(s => {
      if (!aabb(hero, s)) return true;
      if (world.lives > 0) {
        world.lives--;
      }
      return false;
    });

    // trigger Game Over once
    if (world.lives <= 0 && !gameOver) {
      world.lives = 0;      // clamp at 0
      gameOver = true;
      paused = true;
    }
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#0c1230'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#2a3b66'; ctx.fillRect(0,332,canvas.width,4);
    ctx.fillStyle='#7bd8ff'; ctx.fillRect(hero.x, hero.y, hero.w, hero.h);
    ctx.fillStyle='#ffd84d'; world.coins.forEach(c => ctx.fillRect(c.x,c.y,c.w,c.h));
    ctx.fillStyle='#ff6b6b'; world.spikes.forEach(s => ctx.fillRect(s.x,s.y,s.w,s.h));
    document.getElementById('score').textContent = world.score;
    document.getElementById('lives').textContent = world.lives;

    if (gameOver) {
      ctx.fillStyle = '#000a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = '20px system-ui';
      ctx.fillText('Game Over - Press R to restart', canvas.width / 2, canvas.height / 2);
    }
  }

  let paused = false;
  let gameOver = false;
  function loop(now = performance.now()){
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    if (!paused && !gameOver) update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function start(){
    // reset world
    world.score = 0;
    world.lives = 3;
    hero.x = 50;
    hero.y = 300;
    hero.vy = 0;
    hero.onGround = true;
    world.coins = [];
    world.spikes = [];
    last = performance.now();
    paused = false;
    gameOver = false;
  }
  
  window.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'r') start();
  });

  window.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'p') paused=!paused; 
  }); 

  window.addEventListener('keydown', e => keys.add(e.code === 'Space' ? 'Space' : e.key));

  window.addEventListener('keyup',   e => keys.delete(e.code === 'Space' ? 'Space' : e.key));

  window.addEventListener('keydown', e => {
      if(e.key === 'Escape' && helpModal.hidden == true){
        helpModal.hidden = false;
        if(!paused) paused = !paused;
      }
      else if(e.key === 'Escape' && helpModal.hidden == false){
        helpModal.hidden = true;
        if(paused) paused = !paused;
      }
    });

  if (helpBtn && helpModal && closeHelp) {
    helpBtn.addEventListener('click', () => {
      helpModal.hidden = false;
      if(!paused) paused = !paused;
    });

    closeHelp.addEventListener('click', () => {
      helpModal.hidden = true;
      if(paused) paused = !paused;
    });

    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) {
        helpModal.hidden = true;
      }
    });
  }

  loop();

})();
