(function (window) {
  "use strict";

  var self;

  function ImageViewer(canvasId, imageUrl){
    self = this;

    // canvas
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");

    // image scale
    this.scale = 1;
    this.scale_old = null;

    // image center
    this.center = {
      x: 0,
      y: 0
    }
    this.center_old = null;

    // image
    this.image = new Image();
    this.image.addEventListener('load', this._onImageLoad, false);
    this.image.src = imageUrl;
    this.image_old = null;

    // render loop
    this.FPS = 100/30;
    this.tickInterval = null;

    this.InputHandler = new InputHandler(this.canvas, this);
  }
  
  ImageViewer.prototype._onImageLoad = function(){
    // set scale to use as much space inside the canvas as possible
    if(((self.canvas.height / self.image.height) * self.image.width) <= self.canvas.width){
      self.scale = self.canvas.height / self.image.height;
    } else {
      self.scale = self.canvas.width / self.image.width;
    }

    // center at image center
    self.center.x = self.image.width / 2;
    self.center.y = self.image.height / 2;

    // start render loop
    self.tickInterval = setInterval(function(){self._render()}, self.FPS);
  };

  ImageViewer.prototype._isDirty = function(newScale){
    return !((this.image === this.image_old)
        && (this.center === this.center_old)
        && (this.scale === this.scale_old));
  };

  ImageViewer.prototype._render = function(){
    // check if dirty
    if(!this._isDirty()) return;

    // reset flags
    this.image_old = this.image;
    this.center_old = this.center;
    this.scale_old = this.scale;

    // clear canvas
    this.context.clearRect ( 0 , 0 , this.canvas.width, this.canvas.height );

    // calculate image properties
    var widthToRight = this.image.width - this.center.x
      , widthToLeft = this.center.x
      , heightToTop = this.center.y
      , heightToBottom = this.image.height - this.center.y
      , maxPartWidth = this.canvas.width / this.scale
      , maxPartHeight = this.canvas.height / this.scale
      , actualPartWidthRight = widthToRight >= (maxPartWidth / 2) ? maxPartWidth / 2 : widthToRight
      , actualPartWidthLeft = widthToLeft >= (maxPartWidth / 2) ? maxPartWidth / 2 : widthToLeft
      , actualPartWidth = actualPartWidthRight + actualPartWidthLeft
      , actualPartHeightTop = heightToTop >= (maxPartHeight / 2) ? maxPartHeight / 2 : heightToTop
      , actualPartHeightBottom = heightToBottom >= (maxPartHeight / 2) ? maxPartHeight / 2 : heightToBottom
      , actualPartHeight = actualPartHeightTop + actualPartHeightBottom
      , partX = this.center.x - actualPartWidthLeft
      , partY = this.center.y - actualPartHeightTop
      , canvasX = ((maxPartWidth / 2) - actualPartWidthLeft) * this.scale
      , canvasY = ((maxPartHeight / 2) - actualPartHeightTop) * this.scale
      , canvasWidth = actualPartWidth * this.scale
      , canvasHeight = actualPartHeight * this.scale;

    // draw image
    this.context.drawImage(
      this.image,
      partX, partY, actualPartWidth, actualPartHeight, // part of image
      canvasX, canvasY, canvasWidth, canvasHeight  // position and size within canvas
    );
  };

  function InputHandler(canvas, imageViewer) {
    this.canvas = canvas;
    this.imageViewer = imageViewer;

    this.canvas.addEventListener('DOMMouseScroll', this._onMouseWheel);
    this.canvas.addEventListener('mousewheel', this._onMouseWheel);
  };

  InputHandler.prototype._onMouseWheel = function(evt){
    if (!evt) evt = event;
    var zoomFactor = (evt.detail<0 || evt.wheelDelta>0)
                    ? 0.9 // up -> smaller
                    : 1.1; // down -> larger
    self.scale = self.scale * zoomFactor;
  };

  window.ImageViewer = ImageViewer;
}(window));
