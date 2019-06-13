"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var round_progress_service_1 = require("./round-progress.service");
var round_progress_config_1 = require("./round-progress.config");
var round_progress_ease_1 = require("./round-progress.ease");
var GRAD_STROKE = "gradFill";
var DIRECTIONS = ["top", "right", "bottom", "left"];
var X1_POS = [0, 0, 0, 100];
var X2_POS = [0, 100, 0, 0];
var Y1_POS = [100, 0, 0, 0];
var Y2_POS = [0, 0, 100, 0];
var RoundProgressComponent = /** @class */ (function () {
    function RoundProgressComponent(_service, _easing, _defaults, _ngZone, _renderer) {
        this._service = _service;
        this._easing = _easing;
        this._defaults = _defaults;
        this._ngZone = _ngZone;
        this._renderer = _renderer;
        this._lastAnimationId = 0;
        this.radius = this._defaults.radius;
        this.animation = this._defaults.animation;
        this.animationDelay = this._defaults.animationDelay;
        this.duration = this._defaults.duration;
        this.stroke = this._defaults.stroke;
        this.color = this._defaults.color;
        this.gradDirection = this._defaults.gradDirection;
        this.background = this._defaults.background;
        this.responsive = this._defaults.responsive;
        this.clockwise = this._defaults.clockwise;
        this.semicircle = this._defaults.semicircle;
        this.rounded = this._defaults.rounded;
        this.endMarker = this._defaults.endMarker;
        this.onRender = new core_1.EventEmitter();
    }
    /** Animates a change in the current value. */
    /** Animates a change in the current value. */
    RoundProgressComponent.prototype._animateChange = /** Animates a change in the current value. */
    function (from, to) {
        var _this = this;
        if (typeof from !== 'number') {
            from = 0;
        }
        to = this._clamp(to);
        from = this._clamp(from);
        var self = this;
        var changeInValue = to - from;
        var duration = self.duration;
        // Avoid firing change detection for each of the animation frames.
        self._ngZone.runOutsideAngular(function () {
            var start = function () {
                var startTime = self._service.getTimestamp();
                var id = ++self._lastAnimationId;
                requestAnimationFrame(function animation() {
                    var currentTime = Math.min(self._service.getTimestamp() - startTime, duration);
                    var value = self._easing[self.animation](currentTime, from, changeInValue, duration);
                    self._setPath(value);
                    self.onRender.emit(value);
                    if (id === self._lastAnimationId && currentTime < duration) {
                        requestAnimationFrame(animation);
                    }
                });
            };
            if (_this.animationDelay > 0) {
                setTimeout(start, _this.animationDelay);
            }
            else {
                start();
            }
        });
    };
    /** Sets the path dimensions. */
    /** Sets the path dimensions. */
    RoundProgressComponent.prototype._setPath = /** Sets the path dimensions. */
    function (value) {
        if (this._path) {
            this._renderer.setElementAttribute(this._path.nativeElement, 'd', this._service.getArc(value, this.max, this.radius - this.stroke / 2, this.radius, this.semicircle));
        }
    };
    /** Clamps a value between the maximum and 0. */
    /** Clamps a value between the maximum and 0. */
    RoundProgressComponent.prototype._clamp = /** Clamps a value between the maximum and 0. */
    function (value) {
        return Math.max(0, Math.min(value || 0, this.max));
    };
    /** Determines the SVG transforms for the <path> node. */
    /** Determines the SVG transforms for the <path> node. */
    RoundProgressComponent.prototype.getPathTransform = /** Determines the SVG transforms for the <path> node. */
    function () {
        var diameter = this._diameter;
        if (this.semicircle) {
            return this.clockwise ?
                "translate(0, " + diameter + ") rotate(-90)" :
                "translate(" + (diameter + ',' + diameter) + ") rotate(90) scale(-1, 1)";
        }
        else if (!this.clockwise) {
            return "scale(-1, 1) translate(-" + diameter + " 0)";
        }
    };
    /** Resolves a color through the service. */
    /** Resolves a color through the service. */
    RoundProgressComponent.prototype.resolveColor = /** Resolves a color through the service. */
    function (color) {
        return this._service.resolveColor(color);
    };
    /** Resolves the color or the linear gradient for the progress stroke  */
    /** Resolves the color or the linear gradient for the progress stroke  */
    RoundProgressComponent.prototype.resolveStroke = /** Resolves the color or the linear gradient for the progress stroke  */
    function () {
        return !this._useGrad ? this.resolveColor(this.color) : "url(#" + GRAD_STROKE + ")";
    };
    RoundProgressComponent.prototype.resolveDotColor = function () {
        return !this._useGrad ? this.resolveColor(this.color) : this.gradEndColor;
    };
    RoundProgressComponent.prototype.resolveDotX = function () {
        var allCoords = this._service.getArc(this.current, this.max, this.radius - this.stroke / 2, this.radius, this.semicircle);
        var pathElements = allCoords.split(" ");
        return pathElements[1];
    };
    RoundProgressComponent.prototype.resolveDotY = function () {
        var allCoords = this._service.getArc(this.current, this.max, this.radius - this.stroke / 2, this.radius, this.semicircle);
        var pathElements = allCoords.split(" ");
        return pathElements[2];
    };
    /** Resolves linear gradient direction */
    /** Resolves linear gradient direction */
    RoundProgressComponent.prototype.resolveGradCorner = /** Resolves linear gradient direction */
    function (corner) {
        if (!this._useGrad)
            return "0%";
        var index = DIRECTIONS.indexOf(this.gradDirection);
        if (index < 0)
            index = DIRECTIONS.indexOf(this._defaults.gradDirection);
        var perc = 0;
        switch (corner) {
            case 'x1':
                perc = X1_POS[index];
                break;
            case 'x2':
                perc = X2_POS[index];
                break;
            case 'y1':
                perc = Y1_POS[index];
                break;
            case 'y2':
                perc = Y2_POS[index];
                break;
        }
        return perc + "%";
    };
    /** Change detection callback. */
    /** Change detection callback. */
    RoundProgressComponent.prototype.ngOnChanges = /** Change detection callback. */
    function (changes) {
        if (changes.current) {
            this._animateChange(changes.current.previousValue, changes.current.currentValue);
        }
        else {
            this._setPath(this.current);
        }
    };
    Object.defineProperty(RoundProgressComponent.prototype, "_diameter", {
        /** Diameter of the circle. */
        get: /** Diameter of the circle. */
        function () {
            return this.radius * 2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoundProgressComponent.prototype, "_elementHeight", {
        /** The CSS height of the wrapper element. */
        get: /** The CSS height of the wrapper element. */
        function () {
            if (!this.responsive) {
                return (this.semicircle ? this.radius : this._diameter) + 'px';
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoundProgressComponent.prototype, "_viewBox", {
        /** Viewbox for the SVG element. */
        get: /** Viewbox for the SVG element. */
        function () {
            var diameter = this._diameter;
            return "0 0 " + diameter + " " + (this.semicircle ? this.radius : diameter);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoundProgressComponent.prototype, "_paddingBottom", {
        /** Bottom padding for the wrapper element. */
        get: /** Bottom padding for the wrapper element. */
        function () {
            if (this.responsive) {
                return this.semicircle ? '50%' : '100%';
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoundProgressComponent.prototype, "_useGrad", {
        get: function () {
            return this.gradStartColor !== undefined && this.gradEndColor !== undefined;
        },
        enumerable: true,
        configurable: true
    });
    RoundProgressComponent.decorators = [
        { type: core_1.Component, args: [{
                    selector: 'round-progress',
                    template: "\n    <svg xmlns=\"http://www.w3.org/2000/svg\" [attr.viewBox]=\"_viewBox\">\n      <defs>\n        <linearGradient \n          id=\"" + GRAD_STROKE + "\" \n          [attr.x1]=\"resolveGradCorner('x1')\"\n          [attr.x2]=\"resolveGradCorner('x2')\"\n          [attr.y1]=\"resolveGradCorner('y1')\"\n          [attr.y2]=\"resolveGradCorner('y2')\"\n          >\n          <stop offset=\"0%\" [attr.stop-color]=\"gradStartColor\" stop-opacity=\".75\" />\n          <stop offset=\"100%\" [attr.stop-color]=\"gradEndColor\" stop-opacity=\".75\" />\n        </linearGradient>\n      </defs>\n      <circle\n        fill=\"none\"\n        [attr.cx]=\"radius\"\n        [attr.cy]=\"radius\"\n        [attr.r]=\"radius - stroke / 2\"\n        [style.stroke]=\"resolveColor(background)\"\n\t\t[style.stroke-width]=\"stroke\"/>\n\t\t\n      <path\n        #path\n        fill=\"none\"\n        [style.stroke-width]=\"stroke\"\n        [style.stroke-linecap]=\"rounded ? 'round' : ''\"\n        [attr.transform]=\"getPathTransform()\"\n\t\t[attr.stroke]=\"resolveStroke()\"/>\n\t\t\n\t\t<circle \n\t\t\t*ngIf=\"endMarker\"\n\t\t\t[attr.fill]=\"resolveDotColor()\" \n\t\t\t[attr.cx]=\"resolveDotX()\" \n\t\t\t[attr.cy]=\"resolveDotY()\" \n\t\t\t[attr.r]=\"stroke*0.8\" \n\t\t\tstyle=\"stroke-width: 0;\"></circle>\n    </svg>\n  ",
                    host: {
                        'role': 'progressbar',
                        '[attr.aria-valuemin]': 'current',
                        '[attr.aria-valuemax]': 'max',
                        '[style.width]': "responsive ? '' : _diameter + 'px'",
                        '[style.height]': '_elementHeight',
                        '[style.padding-bottom]': '_paddingBottom',
                        '[class.responsive]': 'responsive'
                    },
                    styles: [
                        ":host {\n      display: block;\n      position: relative;\n      overflow: hidden;\n    }",
                        ":host.responsive {\n      width: 100%;\n      padding-bottom: 100%;\n    }",
                        ":host.responsive > svg {\n      position: absolute;\n      width: 100%;\n      height: 100%;\n      top: 0;\n      left: 0;\n    }"
                    ]
                },] },
    ];
    /** @nocollapse */
    RoundProgressComponent.ctorParameters = function () { return [
        { type: round_progress_service_1.RoundProgressService, },
        { type: round_progress_ease_1.RoundProgressEase, },
        { type: undefined, decorators: [{ type: core_1.Inject, args: [round_progress_config_1.ROUND_PROGRESS_DEFAULTS,] },] },
        { type: core_1.NgZone, },
        { type: core_1.Renderer, },
    ]; };
    RoundProgressComponent.propDecorators = {
        "_path": [{ type: core_1.ViewChild, args: ['path',] },],
        "current": [{ type: core_1.Input },],
        "max": [{ type: core_1.Input },],
        "radius": [{ type: core_1.Input },],
        "animation": [{ type: core_1.Input },],
        "animationDelay": [{ type: core_1.Input },],
        "duration": [{ type: core_1.Input },],
        "stroke": [{ type: core_1.Input },],
        "color": [{ type: core_1.Input },],
        "gradStartColor": [{ type: core_1.Input },],
        "gradEndColor": [{ type: core_1.Input },],
        "gradDirection": [{ type: core_1.Input },],
        "background": [{ type: core_1.Input },],
        "responsive": [{ type: core_1.Input },],
        "clockwise": [{ type: core_1.Input },],
        "semicircle": [{ type: core_1.Input },],
        "rounded": [{ type: core_1.Input },],
        "endMarker": [{ type: core_1.Input },],
        "onRender": [{ type: core_1.Output },],
    };
    return RoundProgressComponent;
}());
exports.RoundProgressComponent = RoundProgressComponent;
//# sourceMappingURL=round-progress.component.js.map