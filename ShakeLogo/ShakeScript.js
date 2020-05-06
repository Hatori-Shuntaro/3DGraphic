'use strict'

const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');

let logoImage = new Image();
logoImage.src = 'logo1.png';
ctx.drawImage(logoImage, 0, 0);