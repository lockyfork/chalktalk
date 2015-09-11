function() {
   this.labels = 'matrix Bezier Hermite'.split(' ');
   this.inLabel = ['', '\u2715'];
   function rounded(x) { return floor(x * 100) / 100; }
   var c = "cos";
   var s = "sin";
   var nc = "-cos";
   var ns = "-sin";
   this.row = -1;
   this.col = -1;
   this.identityMatrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
   this.mxy = [0,0];
   this.computeMxy = function(x,y) { this.mxy = m.transform([x,y]); }
   this.showText = true;
   this.vals = [
       [ 1 , 0 , 0 , 0,   0 , 1 , 0 , 0,    0 , 0 , 1 , 0,    0 , 0 , 0 , 1 ],
       [ 1 , 0 , 0 , 0,   0 , 1 , 0 , 0,    0 , 0 , 1 , 0,   'A','B','C', 1 ],
       [ 1 , 0 , 0 , 0,   0 ,'A','B', 0,    0 ,'C','A', 0,    0 , 0 , 0 , 1 ],
       ['A', 0 ,'C', 0,   0 , 1 , 0 , 0,   'B', 0 ,'A', 0,    0 , 0 , 0 , 1 ],
       ['A','B', 0 , 0,  'C','A', 0 , 0,    0 , 0 , 1 , 0,    0 , 0 , 0 , 1 ],
       ['A', 0 , 0 , 0,   0 ,'B', 0 , 0,    0 , 0 ,'C', 0,    0 , 0 , 0 , 1 ],
       [ 1 , 0 , 0 ,'A',  0 , 1 , 0 ,'B',   0 , 0 , 1 ,'C',   0 , 0 , 0 , 1 ],
    ];
   this.mode = 0;
   this.onClick = function() { this.mode = (this.mode + 1) % this.vals.length; }
   this.cmdMode = 0;
   this.onCmdClick = function() { this.cmdMode = (this.cmdMode + 1) % 2; }
   this.mouseDown = function(x,y) { this.computeMxy(x, y); }
   this.mouseDrag = function(x,y) { this.computeMxy(x, y); }
   this.mouseUp   = function(x,y) { this.computeMxy(x, y); }

   this.swipe[0] = ['select\nrow'   , function() { this.row = max(0, min(3, floor((1 + this.mxy[0]) / 2 * 4))); }];
   this.swipe[2] = ['select\ncolumn', function() { this.col = max(0, min(3, floor((1 - this.mxy[1]) / 2 * 4))); }];
   this.swipe[4] = ['no\nrow'       , function() { this.row = -1; }];
   this.swipe[6] = ['no\ncolumn'    , function() { this.col = -1; }];

   function sketchMatrix() {
      mCurve([[1,1],[1,-1],[-1,-1]]);
      lineWidth(1);
      mLine([ .5,1],[ .5,-1]);
      mLine([-1,-.5],[1,-.5]);
   }

   this.render = function(elapsed) {
      var type = this.labels[this.selection];

      switch (type) {
      case 'matrix':
         sketchMatrix();
         break;
      case 'Bezier':
         this.duringSketch(function() {
            mLine([-1, 1],[-1,-1]);
            mCurve( [[-1,1],[-.5,1]].concat(makeOval(-1,0,1,1,16,PI/2,-PI/2))
                                    .concat([[-.5,0],[-1,0]]) );
            mCurve( [[-1,0],[-.25,0]].concat(makeOval(-.75,-1,1,1,16,PI/2,-PI/2))
                                     .concat([[-.25,-1],[-1,-1]]) );
         });
         this.afterSketch(function() {
            sketchMatrix();
         });
         break;
      case 'Hermite':
         this.duringSketch(function() {
            mLine([-1, 1],[-1,-1]);
            mLine([-1, 0],[ 1, 0]);
            mLine([ 1, 1],[ 1,-1]);
         });
         this.afterSketch(function() {
            sketchMatrix();
         });
         break;
      }

      this.afterSketch(function() {

         if (this.cmdMode == 1) {
            color(scrimColor(0.3));
            mFillRect([-1,-.5], [.5,1]);
            color(defaultPenColor);
         }

         mLine([-1, .5],[1,  .5]);
         mLine([-1,  0],[1,   0]);
         mLine([-.5, 1],[-.5,-1]);
         mLine([  0, 1],[  0,-1]);
         lineWidth(2);
         mCurve([[-1,-1],[-1,1],[1,1]]);

         var out = [];

         switch (type) {

         case 'Bezier':
            out = [ -1,3,-3,1 , 3,-6,3,0 , -3,3,0,0 , 1,0,0,0 ];
            break;

         case 'Hermite':
            out = [ 2,-3,0,1 , -2,3,0,0 , 1,-2,1,0 , 1,-1,0,0 ];
            break;

         case 'matrix':
            if (isMatrixArray(this.inValue[0])) {
               for (var i = 0 ; i < 16 ; i++)
                  out.push(roundedString(this.inValues[i]));
            }
            else {
               var sub = ["x","y","z"];
               switch (this.mode) {
               case 1: sub = ["tx","ty","tz"]; break;
               case 2:
               case 3:
               case 4: sub = ["cos","sin","-sin"]; break;
               case 5: sub = ["sx","sy","sz"]; break;
               case 6: sub = ["px","py","pz"]; break;
               }

               if (isDef(this.inValue[0])) {
                  var x = 0, y = 0, z = 0;
		  if (this.inValue[0] instanceof Array) {
                     x = rounded(this.inValue[0][0], 0);
                     y = rounded(this.inValue[0][1], x);
                     z = rounded(this.inValue[0][2], y);
                  }
		  else {
		     var value = parseFloat(this.inValue[0]);
                     if (isNumeric(value))
                        x = y = z = rounded(value, 0);
                  }

                  switch (this.mode) {
                  case 1:
                  case 5:
                  case 6:
                     sub[0] = x;
                     sub[1] = y;
                     sub[2] = z;
                     break;
                  case 2:
                  case 3:
                  case 4:
                     sub[0] = rounded(cos(x));
                     sub[1] = rounded(sin(y));
                     sub[2] = -sub[1];
                     break;
                  }
               }
            }

            var vals = this.vals[this.mode];

            for (var col = 0 ; col < 4 ; col++)
            for (var row = 0 ; row < 4 ; row++) {
               var val = "" + vals[row + 4 * col];
               if (val == "A") val = sub[0];
               if (val == "B") val = sub[1];
               if (val == "C") val = sub[2];
               out.push(val);
            }

            break;
         }

         if (this.showText)
            for (var col = 0 ; col < 4 ; col++)
            for (var row = 0 ; row < 4 ; row++) {
               var x = (col - 1.5) / 2;
               var y = (1.5 - row) / 2;
               var val = out[row + 4 * col];
               textHeight((this.xhi - this.xlo) / 9 / pow(("" + val).length, 0.4));
               mText(val, [x, y], .5, .5);
            }

         if (this.row >= 0) {
            color(scrimColor(.33));
            var y = 1 - 2 * (this.row / 4);
            mFillCurve([ [-1,y], [1,y], [1,y-.5], [-1,y-.5], [-1,y] ]);
         }

         if (this.col >= 0) {
            color(scrimColor(.33));
            var x = 2 * (this.col / 4) - 1;
            mFillCurve([ [x,-1], [x,1], [x+.5,1], [x+.5,-1], [x,-1] ]);
         }

         for (var i = 0 ; i < 16 ; i++) {
            var value = parseFloat(out[i]);
            this.matrixValues[i] = isNumeric(value) ? value : out[i];
         }
      });
   }

   this.output = function() {
      var type = this.labels[this.selection];
      var outValue = type != 'matrix' || this.inValues.length > 0 ? this.matrixValues : this.identityMatrix;
      if (isDef(this.inValue[1]))
         outValue = mult(this.inValue[1], outValue);
      return outValue;
   }

   this.matrixValues = newArray(16);
}

