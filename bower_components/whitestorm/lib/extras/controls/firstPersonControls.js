'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.firstPersonControls = firstPersonControls;

var _three = require('three');

var THREE = _interopRequireWildcard(_three);

var _api = require('../api');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var PI_2 = Math.PI / 2;

function firstPersonControls(object) {
  var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return function (world) {
    var target = (0, _api.extend)(params, {
      block: document.getElementById('blocker'),
      speed: 1,
      ypos: 1
    });

    var controls = new function (camera, mesh, params) {
      var velocityFactor = 1;
      var runVelocity = 0.25;

      mesh.setAngularFactor({ x: 0, y: 0, z: 0 });

      /* Init */
      var scope = this;
      var player = mesh,
          pitchObject = new THREE.Object3D();

      pitchObject.add(camera.getNative());

      var yawObject = new THREE.Object3D();

      yawObject.position.y = params.ypos; // eyes are 2 meters above the ground
      yawObject.add(pitchObject);

      var quat = new THREE.Quaternion();

      var canJump = false,

      // Moves.
      moveForward = false,
          moveBackward = false,
          moveLeft = false,
          moveRight = false;

      player.addEventListener('collision', function (otherObject, v, r, contactNormal) {
        if (contactNormal.y < 0.5) // Use a "good" threshold value between 0 and 1 here!
          canJump = true;
      });

      function onMouseMove(event) {
        if (scope.enabled === false) return;

        var movementX = typeof event.movementX === 'number' ? event.movementX : typeof event.mozMovementX === 'number' ? event.mozMovementX : typeof event.getMovementX === 'function' ? event.getMovementX() : 0;
        var movementY = typeof event.movementY === 'number' ? event.movementY : typeof event.mozMovementY === 'number' ? event.mozMovementY : typeof event.getMovementY === 'function' ? event.getMovementY() : 0;

        yawObject.rotation.y -= movementX * 0.002;
        pitchObject.rotation.x -= movementY * 0.002;

        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
      }

      function onKeyDown(event) {
        switch (event.keyCode) {
          case 38: // up
          case 87:
            // w
            moveForward = true;
            break;

          case 37: // left
          case 65:
            // a
            moveLeft = true;
            break;

          case 40: // down
          case 83:
            // s
            moveBackward = true;
            break;

          case 39: // right
          case 68:
            // d
            moveRight = true;
            break;

          case 32:
            // space
            if (canJump === true) {
              player.applyCentralImpulse({ x: 0, y: 300, z: 0 });
            }
            canJump = false;
            break;

          case 16:
            // shift
            runVelocity = 0.5;
            break;

          default:
        }
      }

      function onKeyUp(event) {
        switch (event.keyCode) {
          case 38: // up
          case 87:
            // w
            moveForward = false;
            break;

          case 37: // left
          case 65:
            // a
            moveLeft = false;
            break;

          case 40: // down
          case 83:
            // a
            moveBackward = false;
            break;

          case 39: // right
          case 68:
            // d
            moveRight = false;
            break;

          case 16:
            // shift
            runVelocity = 0.25;
            break;

          default:
        }
      }

      document.body.addEventListener('mousemove', onMouseMove, false);
      document.body.addEventListener('keydown', onKeyDown, false);
      document.body.addEventListener('keyup', onKeyUp, false);

      this.enabled = false;

      this.getObject = function () {
        return yawObject;
      };

      this.getDirection = function (targetVec) {
        targetVec.set(0, 0, -1);
        quat.multiplyVector3(targetVec);
      };

      // Moves the camera to the Cannon.js object position
      // and adds velocity to the object if the run key is down.
      var inputVelocity = new THREE.Vector3(),
          euler = new THREE.Euler();

      this.update = function (delta) {
        if (scope.enabled === false) return;

        delta = delta || 0.5;
        delta = Math.min(delta, 0.5);

        inputVelocity.set(0, 0, 0);

        var speed = velocityFactor * delta * params.speed * runVelocity;

        if (moveForward) inputVelocity.z = -speed;
        if (moveBackward) inputVelocity.z = speed;
        if (moveLeft) inputVelocity.x = -speed;
        if (moveRight) inputVelocity.x = speed;

        // Convert velocity to world coordinates
        euler.x = pitchObject.rotation.x;
        euler.y = yawObject.rotation.y;
        euler.order = 'XYZ';

        quat.setFromEuler(euler);

        inputVelocity.applyQuaternion(quat);

        player.applyCentralImpulse({ x: inputVelocity.x * 10, y: 0, z: inputVelocity.z * 10 });
        player.setAngularVelocity({ x: inputVelocity.z * 10, y: 0, z: -inputVelocity.x * 10 });
        player.setAngularFactor({ x: 0, y: 0, z: 0 });

        yawObject.position.copy(player.position);
      };
    }(world.getCamera(), object.getNative(), target);

    if ('pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document) {
      (function () {
        var element = document.body;

        world.pointerlockchange = function () {
          if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
            controls.enabled = true;
            target.block.style.display = 'none';
          } else {
            controls.enabled = false;
            target.block.style.display = 'block';
          }
        };

        document.addEventListener('pointerlockchange', world.pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', world.pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', world.pointerlockchange, false);

        world.pointerlockerror = function () {
          console.warn('Pointer lock error.');
        };

        document.addEventListener('pointerlockerror', world.pointerlockerror, false);
        document.addEventListener('mozpointerlockerror', world.pointerlockerror, false);
        document.addEventListener('webkitpointerlockerror', world.pointerlockerror, false);

        target.block.addEventListener('click', function () {
          element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

          element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

          if (/Firefox/i.test(navigator.userAgent)) {
            (function () {
              var fullscreenchange = function fullscreenchange() {
                if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {
                  document.removeEventListener('fullscreenchange', fullscreenchange);
                  document.removeEventListener('mozfullscreenchange', fullscreenchange);

                  element.requestPointerLock();
                }
              };

              document.addEventListener('fullscreenchange', fullscreenchange, false);
              document.addEventListener('mozfullscreenchange', fullscreenchange, false);

              element.requestFullscreen();
            })();
          } else element.requestPointerLock();
        });
      })();
    } else console.warn('Your browser does not support the PointerLock WHS.API.');

    function callback(world) {
      world.getScene().add(world.controls.getObject());
    }

    return [controls, callback];
  };
}
//# sourceMappingURL=firstPersonControls.js.map
