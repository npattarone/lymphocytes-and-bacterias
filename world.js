function blastoff() {
  let canvas = $("#canvas")[0];
  let ctx = canvas.getContext('2d');

  let lymphocytesNum = 10;
  let bacteriaNum = 2;

  let fps = 100;

  canvas.width = $('#canvas-container').width();
  $(window).resize(function () {
    let width = $('#canvas-container').width();
    canvas.width = width;
    world.width = width;
  })

  let world = {
    width: 0,
    height: 0,
    lymphocytes: [],
    bacterias: [],
    width: canvas.width,
    height: canvas.height,
    context: ctx
  }

  // popullate
  for (let i = 0; i < lymphocytesNum; i++) {
    let x = Math.random() * world.width;
    let y = Math.random() * world.height;

    world.lymphocytes[i] = new Lymphocyte(world, x, y);
    world.lymphocytes[i].velocity.random();
  }

  for (let i = 0; i < bacteriaNum; i++) {
    let x = Math.random() * (world.width - 100);
    let y = Math.random() * (world.height - 100);

    world.bacterias[i] = new Bacteria(world, x, y);
    world.bacterias[i].velocity.random();
  }

  let targetXBacteria = function (creature) {
    let cohesion = creature.cohesion(world.bacterias);
    return cohesion.x / world.width;
  }

  let targetYBacteria = function (creature) {
    let cohesion = creature.cohesion(world.bacterias);
    return cohesion.y / world.height;
  }

  let targetAngleBacteria = function (creature) {
    let alignment = creature.align(world.bacterias);
    return (alignment.angle() + Math.PI) / (Math.PI * 2);
  }

  let targetXLymphocyte = function (creature) {
    let cohesion = creature.cohesion(world.bacterias);
    return cohesion.x / world.width;
  }

  let targetYLymphocyte = function (creature) {
    let cohesion = creature.cohesion(world.bacterias);
    return cohesion.y / world.height;
  }

  let targetAngleLymphocyte = function (creature) {
    let alignment = creature.align(world.bacterias);
    return (alignment.angle() + Math.PI) / (Math.PI * 2);
  }

  let loopLymphocytes = function () {
    // fade effect
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#f4f4f4';
    ctx.fillRect(0, 0, world.width, world.height);
    ctx.globalAlpha = 1;

    // update each creature
    let lymphocytes = world.lymphocytes;
    let bacterias = world.bacterias;
    lymphocytes.forEach(function (creature) {
      // move
      let input = [];
      for (let i in bacterias) {
        input.push(bacterias[i].location.x);
        input.push(bacterias[i].location.y);
        input.push(bacterias[i].velocity.x);
        input.push(bacterias[i].velocity.y);
      }
      let output = creature.network.activate(input);
      creature.moveTo(output);

      // learn
      let learningRate = .3;
      let target = [targetXLymphocyte(creature), targetYLymphocyte(creature), targetAngleLymphocyte(creature)];
      creature.network.propagate(learningRate, target);

      // draw
      creature.draw();
    });
    if (true)
      setTimeout(loopLymphocytes, 1000 / fps);
  }

  let loopBacterias = function () {
    // fade effect
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#f4f4f4';
    ctx.fillRect(0, 0, world.width, world.height);
    ctx.globalAlpha = 1;

    // update each creature
    let bacterias = world.bacterias;
    let lymphocytes = world.lymphocytes;
    bacterias.forEach(function (creature) {
      // move
      let badInput = [];
      for (let i in lymphocytes) {
        badInput.push(lymphocytes[i].location.x);
        badInput.push(lymphocytes[i].location.y);
        badInput.push(lymphocytes[i].velocity.x);
        badInput.push(lymphocytes[i].velocity.y);
      }

      let goodInput = [];
      let i = 0;
      do {
        let x = Math.random() * world.width;
        let y = Math.random() * world.height;
        let velocity = new Vector(x, y);

        let existX = badInput.find(x => { return x == x; });
        let existY = badInput.find(y => { return y == y; });
        let existVX = badInput.find(vx => { return vx == velocity.x; });
        let existVY = badInput.find(vy => { return vy == velocity.y; });

        if (!existX) {
          goodInput.push(x);
        }
        if (!existY) {
          goodInput.push(y);
        }
        if (!existVX) {
          goodInput.push(velocity.x);
        }
        if (!existVY) {
          goodInput.push(velocity.y);
        }
        i++;
      }
      while (goodInput.length < 40);

      let output = creature.network.activate(goodInput);
      creature.moveTo(output);

      // learn
      let learningRate = .3;
      let target = [targetXBacteria(creature), targetYBacteria(creature), targetAngleBacteria(creature)];
      creature.network.propagate(learningRate, target);

      // draw
      creature.draw();
    });
    if (true)
      setTimeout(loopBacterias, 1000 / fps);
  }

  // blastoff
  loopBacterias();
  loopLymphocytes();
};