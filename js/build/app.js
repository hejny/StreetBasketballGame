var levelData=[{level:1,basketY:20,basketDistance:80,basketColor:16711680,force:{z:-2,xk:8}},{level:2,basketY:25,basketDistance:100,basketColor:255,force:{z:-3}},{level:3,basketY:30,basketDistance:120,basketColor:65280,force:{z:-4}},{level:4,basketY:25,basketDistance:150,basketColor:16776960,force:{z:-5}}],IntToHex=function(e,t){var a=Number(e).toString(16);for(t="undefined"==typeof t||null===t?t=2:t;a.length<t;)a="0"+a;return"#"+a},TexUtils={generateMenuTexture:function(e){var t=1700,a=document.createElement("canvas");a.width=2e3,a.height=1e3;var o=a.getContext("2d");o.font="Bold 100px Richardson",o.fillStyle="#2D3134",o.fillText("Time",0,150),o.fillText(e.time.toFixed()+"s.",t,150),o.fillText("Attempts",0,300),o.fillText(e.attempts.toFixed(),t,300),o.fillText("Accuracy",0,450),o.fillText(e.accuracy.toFixed(),t,450),o.font="Normal 200px FNL",o.textAlign="center",o.fillText(e.markText,1e3,800);var n=document.createElement("img");n.src=a.toDataURL();var r=new THREE.Texture(n);return r.needsUpdate=!0,r},generateLevelTexture:function(e){var t=document.createElement("canvas");t.width=160,t.height=80;var a=t.getContext("2d");a.fillStyle="#000",a.beginPath(),a.rect(0,0,160,80),a.fill(),a.fillStyle="#2D3134",a.beginPath(),a.rect(5,5,150,70),a.fill(),a.fillStyle="#000",a.beginPath(),a.arc(80,40,40,0,2*Math.PI,!1),a.fill(),a.font="Bold 60px Richardson",a.fillStyle=e.basketColor?IntToHex(e.basketColor,6):"#2D3134",a.textAlign="center",a.fillText(""+e.level,80,60);var o=document.createElement("img");o.src=t.toDataURL();var n=new THREE.Texture(o);return n.needsUpdate=!0,n},generateLevelEmTexture:function(e){var t=document.createElement("canvas");t.width=160,t.height=80;var a=t.getContext("2d");a.fillStyle="#aaa",a.beginPath(),a.rect(0,0,160,80),a.fill(),a.fillStyle="#222",a.beginPath(),a.rect(5,5,150,70),a.fill(),a.font="Bold 60px Richardson",a.fillStyle="#aaa",a.textAlign="center",a.fillText(""+e.level,80,60);var o=document.createElement("img");o.src=t.toDataURL();var n=new THREE.Texture(o);return n.needsUpdate=!0,n}},EVENTS={_click:function(e){window.addEventListener("click",e.throwBall),window.addEventListener("click",function(){var t=e.world.getRenderer().domElement;!t.fullscreenElement&&e.isMobile&&(t.webkitRequestFullscreen&&t.webkitRequestFullscreen(),t.mozRequestFullscreen&&t.mozRequestFullscreen(),t.msRequestFullscreen&&t.msRequestFullscreen(),t.requestFullscreen&&t.requestFullscreen())})},_move:function(e){["mousemove","touchmove"].forEach(function(t){window.addEventListener(t,e.updateCoords)})},_keypress:function(e){window.addEventListener("keypress",e.checkKeys)},_resize:function(e){e.cursor.xCenter=window.innerWidth/2,e.cursor.yCenter=window.innerHeight/2,window.addEventListener("resize",function(){var e=document.querySelector(".whs canvas").style;e.width="100%",e.height="100%"})}},checkForLevel=function(e){var t=e.levelPlanes,a=e.raycaster,o=e.levelIndicator,n=e.liProgress,r=null,P=new TweenLite.to(e.liProgress,1.5,{data_arc:2*Math.PI,ease:Power2.easeOut,onUpdate:function(){e.liProgress.G_({arc:e.liProgress.data_arc})},onComplete:function(){e.changeLevel(r),e.goBackToLevel()}});return P.kill(),new WHS.Loop(function(){var i=e.camera.position,l=e.ball.position,s=l.clone().sub(i.clone()).normalize();a.set(i,s);var c=a.intersectObjects(t);c.length>=1&&o.position.copy(a.ray.at(i.distanceTo(l)-8)),!e.indicatorStatus&&c.length>=1?(e.indicatorStatus=!0,o.show(),r=c[0].object.data,P.restart()):0===c.length&&(e.indicatorStatus=!1,o.hide(),0!==n.data_arc&&(P.kill(),n.data_arc=0,n.G_({arc:.1})))})},loop_raycaster=function(e){var t=e.camera.getNative(),a=e.raycaster,o=e.raycaster.ray,n=e.planeForRaycasting;return new WHS.Loop(function(){a.setFromCamera(new THREE.Vector2(e.cursor.x/window.innerWidth*2-1,2*-(e.cursor.y/window.innerHeight)+1),t);var r=e.ball.position,P=o.at(o.distanceToPlane(n));!e.levelMenuTriggered&&e.animComplete&&r.z>60&&e.triggerLevelMenu(),e.levelMenuTriggered&&e.animComplete&&r.z<170&&e.goBackToLevel(),e.ball.setLinearVelocity(P.sub(r).multiplyScalar(2))})},pick_ball=function(e){return new WHS.Loop(function(){e.thrown||e.pickBall();var t=e.ball.position,a=e.basket.position;t.distanceTo(a)<e.basketGoalDiff&&Math.abs(t.y-a.y+e.basketYDeep)<e.basketYGoalDiff&&!e.goal&&e.onGoal(t,a)})},APP={helpersActive:!0,bgColor:13421772,ballRadius:6,basketColor:16711680,getBasketRadius:function(){return APP.ballRadius+2},basketTubeRadius:.5,basketY:20,basketDistance:80,getBasketZ:function(){return APP.getBasketRadius()+2*APP.basketTubeRadius-APP.basketDistance},basketGoalDiff:2.5,basketYGoalDiff:1,basketYDeep:1,goalDuration:1800,doubleTapTime:300,thrown:!1,doubletap:!1,goal:!1,controlsEnabled:!0,levelMenuTriggered:!1,animComplete:!0,levelPlanes:[],indicatorStatus:!1,isMobile:navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/),cursor:{x:0,y:0,xCenter:window.innerWidth/2,yCenter:window.innerHeight/2},force:{y:6.2,z:-2,m:2400,xk:8},menu:{timeClock:null,time:0,accuracy:0,attempts:0,markText:"",enabled:!1},init:function(){APP.world=new WHS.World({autoresize:"window",softbody:!0,background:{color:APP.bgColor},fog:{type:"regular",hex:16777215},camera:{z:50,y:APP.basketY,aspect:45},physics:{fixedTimeStep:!!APP.isMobile&&1/30},gravity:{y:-200}}),APP.raycaster=new THREE.Raycaster,APP.camera=APP.world.getCamera(),APP.ProgressLoader=new ProgressLoader(APP.isMobile?12:14),APP.createScene(),APP.addLights(),APP.addBasket(),APP.addBall(),APP.initEvents(),APP.initMenu(),APP.camera.lookAt(new THREE.Vector3(0,APP.basketY,0)),APP.world.start(),APP.ProgressLoader.on("step",function(){var e=100+2*APP.ProgressLoader.getPercent();TweenLite.to(document.querySelector(".preloader"),2,{css:{backgroundPositionY:e+"px",bottom:e+"px"},ease:Power2.easeInOut})}),APP.ProgressLoader.on("complete",function(){setTimeout(function(){document.querySelector(".loader").className+=" loaded",setTimeout(function(){document.querySelector(".loader").style.display="none",APP.onLevelStart()},2e3)},2e3)})},createScene:function(){APP.ground=new WHS.Plane({geometry:{buffer:!0,width:1e3,height:800},mass:0,material:{kind:"phong",color:APP.bgColor},pos:{y:-20,z:120},rot:{x:-Math.PI/2}}),APP.ground.addTo(APP.world).then(function(){return APP.ProgressLoader.step()}),APP.wall=APP.ground.clone(),APP.wall.position.y=180,APP.wall.position.z=-APP.basketDistance,APP.wall.rotation.x=0,APP.wall.addTo(APP.world).then(function(){return APP.ProgressLoader.step()}),APP.planeForRaycasting=new THREE.Plane(new THREE.Vector3(0,1,0),-APP.ground.position.y-APP.ballRadius)},addLights:function(){new WHS.PointLight({light:{distance:100,intensity:1,angle:Math.PI},shadowmap:{width:1024,height:1024,left:-50,right:50,top:50,bottom:-50,far:80,fov:90},pos:{y:60,z:-40}}).addTo(APP.world).then(function(){return APP.ProgressLoader.step()}),new WHS.AmbientLight({light:{intensity:.3}}).addTo(APP.world).then(function(){return APP.ProgressLoader.step()})},addBasket:function(){APP.backboard=new WHS.Box({geometry:{buffer:!0,width:41,depth:1,height:28},mass:0,material:{kind:"standard",map:WHS.texture("textures/backboard/1/backboard.jpg"),normalMap:WHS.texture("textures/backboard/1/backboard_normal.png"),displacementMap:WHS.texture("textures/backboard/1/backboard_displacement.png"),normalScale:new THREE.Vector2(.3,.3),metalness:0,roughness:.3},pos:{y:APP.basketY+10,z:APP.getBasketZ()-APP.getBasketRadius()}}),APP.backboard.addTo(APP.world).then(function(){return APP.ProgressLoader.step()}),APP.basket=new WHS.Torus({geometry:{buffer:!0,radius:APP.getBasketRadius(),tube:APP.basketTubeRadius,radialSegments:16,tubularSegments:APP.isMobile?8:16},shadow:{cast:!1},mass:0,material:{kind:"standard",color:APP.basketColor,metalness:.8,roughness:.5,emissive:16764159,emissiveIntensity:.2},pos:{y:APP.basketY,z:APP.getBasketZ()},physics:{type:"concave"},rot:{x:Math.PI/2}}),APP.basket.addTo(APP.world).then(function(){return APP.ProgressLoader.step()});var e=APP.isMobile?8:16;APP.net=new WHS.Cylinder({geometry:{radiusTop:APP.getBasketRadius(),radiusBottom:APP.getBasketRadius()-3,height:15,openEnded:!0,heightSegments:APP.isMobile?2:3,radiusSegments:e},shadow:{cast:!1},physics:{pressure:2e3,friction:.02,margin:.5,anchorHardness:.5,viterations:2,piterations:2,diterations:4,citerations:0},mass:30,softbody:!0,material:{map:WHS.texture("textures/net4.png",{repeat:{y:.7,x:2},offset:{y:.3}}),transparent:!0,opacity:.7,kind:"basic",side:THREE.DoubleSide,depthWrite:!1},pos:{y:APP.basketY-8,z:APP.getBasketZ()}}),APP.net.addTo(APP.world).then(function(){APP.net.getNative().frustumCulled=!1;for(var t=0;t<e;t++)APP.net.appendAnchor(APP.world,APP.basket,t,.8,!0);APP.ProgressLoader.step()})},addBall:function(){APP.ball=new WHS.Sphere({geometry:{buffer:!0,radius:APP.ballRadius,widthSegments:APP.isMobile?16:32,heightSegments:APP.isMobile?16:32},mass:120,material:{kind:"phong",map:WHS.texture("textures/ball.png"),normalMap:WHS.texture("textures/ball_normal.png"),shininess:20,reflectivity:2,normalScale:new THREE.Vector2(.5,.5)},physics:{restitution:3}}),APP.ball.addTo(APP.world).then(function(){return APP.ProgressLoader.step()})},initMenu:function(){APP.isMobile||(APP.text=new WHS.Text({geometry:{text:"Street Basketball",parameters:{size:10,font:"fonts/1.js",height:4}},shadow:{cast:!1,receive:!1},physics:!1,mass:0,material:{kind:"phong",color:16777215,map:WHS.texture("textures/text.jpg",{repeat:{x:.005,y:.005}})},pos:{y:120,z:-40},rot:{x:-Math.PI/3}}),APP.text.addTo(APP.world).then(function(){APP.text.getNative().geometry.computeBoundingBox(),APP.text.position.x=-.5*(APP.text.getNative().geometry.boundingBox.max.x-APP.text.getNative().geometry.boundingBox.min.x),APP.ProgressLoader.step()})),APP.menuDataPlane=new WHS.Plane({geometry:{width:200,height:100},material:{kind:"phong",transparent:!0,opacity:0,fog:!1,shininess:900,reflectivity:.5},physics:!1,rot:{x:-Math.PI/2},pos:{y:-19.5,z:-20}}),APP.menuDataPlane.addTo(APP.world).then(function(){APP.ProgressLoader.step()}),APP.selectLevelHelper=new WHS.Plane({geometry:{width:50,height:50},material:{kind:"basic",transparent:!0,fog:!1,map:WHS.texture("textures/select-level.png")},physics:!1,rot:{x:-Math.PI/2},pos:{y:-19.5,z:90}}),APP.selectLevelHelper.addTo(APP.world),APP.isMobile||(APP.MenuLight=new WHS.SpotLight({light:{distance:100,intensity:3},shadowmap:{cast:!1},pos:{y:200,z:-30},target:{y:120,z:-40}})),APP.LevelLight1=new WHS.SpotLight({light:{distance:800,intensity:0,angle:Math.PI/7},shadowmap:{cast:!1},pos:{y:10,x:500,z:100},target:{z:500,x:-200}}),APP.LevelLight2=APP.LevelLight1.clone(),APP.LevelLight2.position.x=-500,APP.LevelLight2.target.x=200,APP.isMobile||APP.MenuLight.addTo(APP.world).then(function(){APP.ProgressLoader.step()}),APP.LevelLight1.addTo(APP.world).then(function(){APP.ProgressLoader.step()}),APP.LevelLight2.addTo(APP.world).then(function(){APP.ProgressLoader.step()}),APP.loop_raycaster=loop_raycaster(APP),APP.world.addLoop(APP.loop_raycaster)},initLevelMenu:function(){APP.menu.enabled=!0;var e=APP.camera.getNative().getFilmWidth()/APP.camera.getNative().getFilmHeight(),t=-225,a=200,o=4;e<.7?(o=1,t=-90):e<1?(o=2,t=-135):e<1.3?(o=3,t=-180):(o=4,t=-225);for(var n=Math.ceil(levelData.length/o),r=t,P=a,i=new WHS.Plane({geometry:{height:40,width:80},physics:!1,material:{kind:"phong"},pos:{y:-19,x:r},rot:{x:-Math.PI/2}}),l=0;l<n;l++){for(var s=0;s<o;s++){var c=l*o+s;if(console.log(c),levelData[c]){var d=i.clone();r+=90,d.position.z=P,d.position.x=r,d.M_({map:TexUtils.generateLevelTexture(levelData[c])}),d.getNative().data=levelData[c],d.addTo(APP.world),APP.levelPlanes.push(d.getNative())}}P+=60,r=t}APP.levelIndicator=new WHS.Sphere({geometry:{radius:1,widthSegments:16,heightSegments:16},physics:!1,material:{kind:"basic",color:16777215}}),APP.levelIndicator.hide(),APP.levelIndicator.addTo(APP.world),APP.liProgress=new WHS.Torus({geometry:{radius:3,tube:.5,radialSegments:16,tubularSegments:16,arc:0},physics:!1,material:{kind:"basic",color:16777215},rot:{x:Math.PI/2,z:Math.PI/2}}),APP.liProgress.addTo(APP.levelIndicator),APP.liProgress.data_arc=0,APP.checkForLevel=checkForLevel(APP),APP.world.addLoop(APP.checkForLevel),APP.checkForLevel.start()},initEvents:function(){EVENTS._move(APP),EVENTS._click(APP),EVENTS._keypress(APP),EVENTS._resize(APP),APP.pick_ball=pick_ball(APP),APP.world.addLoop(APP.pick_ball),APP.pick_ball.start(),APP.ProgressLoader.step()},updateCoords:function(e){e.preventDefault(),APP.cursor.x=e.touches&&e.touches[0]?e.touches[0].clientX:e.clientX,APP.cursor.y=e.touches&&e.touches[0]?e.touches[0].clientY:e.clientY},checkKeys:function(e){e.preventDefault(),"Space"===e.code&&(APP.thrown=!1)},detectDoubleTap:function(){return APP.doubletap?(APP.thrown=!1,APP.doubletap=!0,!0):(APP.doubletap=!0,setTimeout(function(){APP.doubletap=!1},APP.doubleTapTime),!1)},onLevelStart:function(){APP.menu.timeClock=new THREE.Clock,APP.menu.timeClock.getElapsedTime()},onGoal:function(e,t){var a=new THREE.Vector2(e.x,e.z).distanceTo(new THREE.Vector2(t.x,t.z));APP.menu.time=APP.menu.timeClock.getElapsedTime(),APP.menu.accuracy=100*(1-a/2),APP.helpersActive&&(document.querySelector(".helpers").className+=" deactivated",APP.helpersActive=!1),APP.goal=!0,setTimeout(function(){return APP.goal=!1},APP.goalDuration),APP.goToMenu()},throwBall:function(e){if(e.preventDefault(),!APP.detectDoubleTap()&&APP.controlsEnabled&&!APP.thrown){var t=new THREE.Vector3(APP.force.xk*(APP.cursor.x-APP.cursor.xCenter),APP.force.y*APP.force.m,APP.force.z*APP.force.m);APP.ball.setLinearVelocity(new THREE.Vector3(0,0,0)),APP.ball.applyCentralImpulse(t),t.multiplyScalar(10/APP.force.m),t.y=t.x,t.x=APP.force.y,t.z=0,APP.ball.setAngularVelocity(t),APP.thrown=!0,APP.menu.attempts++}},pickBall:function(){var e=APP.cursor,t=(e.x-e.xCenter)/window.innerWidth*32,a=-(e.y-e.yCenter)/window.innerHeight*32;APP.ball.position.set(t,a,-36)},goBackToLevel:function(){APP.levelMenuTriggered=!1,APP.animComplete=!1,APP.menu.timeClock=new THREE.Clock,APP.menu.time=0,APP.menu.attempts=0,APP.menu.accuracy=0,APP.menu.timeClock.getElapsedTime(),APP.menuDataPlane&&APP.menuDataPlane.hide(),APP.selectLevelHelper&&APP.selectLevelHelper.hide(),APP.checkForLevel&&APP.checkForLevel.stop();var e=APP.camera.clone();e.position.set(0,APP.basketY,50),e.lookAt(new THREE.Vector3(0,APP.basketY,0));var t=e.rotation;TweenLite.to(APP.world.getScene().fog,.5,{far:400,onComplete:function(){APP.loop_raycaster.stop(),APP.controlsEnabled=!0,APP.pick_ball.start(),APP.thrown=!1,APP.ball.setAngularVelocity(new THREE.Vector3(0,0,0))}}),TweenLite.to(APP.world.getScene().fog,1.5,{delay:1.5,far:1e3,ease:Power3.easeOut}),TweenLite.to(APP.camera.rotation,2,{delay:.5,x:t.x,y:t.y,z:t.z,ease:Power3.easeOut}),TweenLite.to(APP.camera.position,2,{delay:.5,z:50,y:APP.basketY,ease:Power3.easeOut,onComplete:function(){APP.animComplete=!0}})},changeLevel:function(e){var t=APP.basketY,a=APP.getBasketZ();e.force.y&&(APP.force.y=e.force.y),e.force.z&&(APP.force.z=e.force.z),e.force.m&&(APP.force.m=e.force.m),e.force.xk&&(APP.force.xk=e.force.xk),APP.backboard.getNative().material.map=WHS.texture("textures/backboard/"+e.level+"/backboard.jpg"),APP.backboard.getNative().material.normalMap=WHS.texture("textures/backboard/"+e.level+"/backboard_normal.png"),APP.backboard.getNative().material.displacementMap=WHS.texture("textures/backboard/"+e.level+"/backboard_displacement.png"),APP.basketY=e.basketY,APP.basketDistance=e.basketDistance,APP.basketColor=e.basketColor,APP.basket.position.y=APP.basketY,APP.basket.position.z=APP.getBasketZ(),APP.net.getNative().geometry.translate(0,APP.basketY-t,APP.getBasketZ()-a),APP.backboard.position.y=APP.basketY+10,APP.backboard.position.z=APP.getBasketZ()-APP.getBasketRadius(),APP.wall.position.z=-APP.basketDistance,APP.basket.M_color=APP.basketColor},goToMenu:function(){APP.pick_ball.stop(),APP.controlsEnabled=!1;var e=0;APP.menu.time.toFixed()<2&&1==APP.menu.attempts.toFixed()&&APP.menu.accuracy.toFixed()>60?(e=3,APP.menu.markText="Excellent"):APP.menu.time.toFixed()<5&&1==APP.menu.attempts.toFixed()&&APP.menu.accuracy.toFixed()>40?(e=2,APP.menu.markText="Good"):(e=1,APP.menu.markText="OK"),APP.menuDataPlane.show(),APP.selectLevelHelper.show(),APP.menuDataPlane.M_({map:TexUtils.generateMenuTexture(APP.menu)}),APP.isMobile?APP.menuDataPlane.getNative().material.opacity=.7:(APP.menuDataPlane.getNative().material.opacity=0,TweenLite.to(APP.menuDataPlane.getNative().material,3,{opacity:.7,ease:Power2.easeInOut}));var t=APP.camera.clone();t.position.y=300,t.lookAt(new THREE.Vector3(0,APP.basketY,0)),TweenLite.to(APP.camera.position,3,{y:300,ease:Power2.easeInOut}),TweenLite.to(APP.camera.rotation,3,{x:t.rotation.x,y:t.rotation.y,z:t.rotation.z,ease:Power2.easeInOut}),setTimeout(function(){APP.loop_raycaster.start()},3e3)},triggerLevelMenu:function(){APP.levelMenuTriggered=!0,APP.animComplete=!1,APP.menu.enabled||APP.initLevelMenu(),APP.checkForLevel&&APP.checkForLevel.start(),TweenLite.to(APP.camera.position,1,{z:350,ease:Power2.easeIn}),APP.isMobile?(APP.LevelLight1.getNative().intensity=10,APP.LevelLight2.getNative().intensity=10):(APP.LevelLight1.getNative().intensity=0,APP.LevelLight2.getNative().intensity=0,TweenLite.to(APP.LevelLight1.getNative(),.5,{intensity:10,ease:Power2.easeIn,delay:1}),TweenLite.to(APP.LevelLight2.getNative(),.5,{intensity:10,ease:Power2.easeIn,delay:1.5,onComplete:function(){APP.animComplete=!0}}))}};basket.require({url:"bower_components/whitestorm/build/whitestorm.js"}).then(function(){APP.init()});