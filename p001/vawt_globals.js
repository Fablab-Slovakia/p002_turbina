/**
 * PROJEKT: Auton\u00F3mna VAWT turb\u00EDna - G4.1
 * S\u00DABOR: vawt_globals.js
 * POPIS: Glob\u00E1lne premenn\u00E9 pre zdie\u013Eanie stavu medzi modulmi.
 */
var scene, renderer, controls, activeCamera, perspCamera, orthoCamera;
var rotorGroup, statorGroup, cfdGroup;
var isOrthographic = false, isCfd = true;
var currentRPM = 0, currentAngle = 50, timeScale = 1.0;
var bladeMeshes = [], pivotGroups = [], armsT = [], armsB = [], levers = [], pushRods = [];
var topHub, bottomHub, motorMesh, shaftMesh;
var govWeights = [], govArmsT = [], govArmsB = [], topCollar, slidingCollar;
var statorPillars = [], topStruts = [], botStruts = [], mountLegs = [];
var streamlines = [];
var TRAIL_LENGTH = 15;