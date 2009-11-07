(function($) {
  var horizontalGroups = [];
  var verticalGroups = [];
  var blockGroups = [];

  var cells = [];
  var allocated = 0;
  var active = null;
  var bound = false;

  var applyCells = function(cell, iterator) {
    var offset = cell.data('sudoku.offset');
    var h = offset[1];
    var v = offset[0];
    var b = Math.floor(h / 3) * 3 + Math.floor(v / 3);

    $.each(horizontalGroups[h], iterator);
    $.each(verticalGroups[v], iterator);
    $.each(blockGroups[b], iterator);
  };

  var initializeBoard = function(initial) {
    for (var i = 0, l = initial.length; i < l; i++) {
      var x = i % 9;
      var y = Math.floor(i / 9);
      var cell = cells[y][x];
      var value = parseInt(initial.charAt(i), 10);

      if (value > 0) {
        allocated++;
        cell.addClass('sudoku-initial').
             text(value).
             data('sudoku.value', value);
      }
      else {
        cell.click(function() {
          if (active) {
            applyCells(active, function() {
              this.removeClass('sudoku-group');
            });

            active.removeClass('sudoku-active');

            if (active.hasClass('sudoku-invalid')) {
              active.removeClass('sudoku-invalid').
                     text('').
                     data('sudoku.value', 0);
            }
          }
          active = $(this).addClass('sudoku-active');

          applyCells(active, function() {
            this.addClass('sudoku-group')
          });
        }).data('sudoku.value', 0);
      }
    }
  };

  var initializeHorizontalGroups = function(cells) {
    horizontalGroups = cells;
  };

  var initializeVerticalGroups = function(cells) {
    for (var x = 0; x < 9; x++) {
      var groups = [];

      for (var y = 0; y < 9; y++) {
        groups.push(cells[y][x]);
      }

      verticalGroups.push(groups);
    }
  };

  var initializeBlockGroups = function(cells) {
    for (var i = 0; i < 9; i++) {
      blockGroups.push([]);
    }

    for (var y = 0; y < 9; y++) {
      for (var x = 0; x < 9; x++) {
        var n = Math.floor(y / 3) * 3 + Math.floor(x / 3);
        blockGroups[n].push(cells[y][x]);
      }
    }
  };

  $.fn.sudoku = function(initial) {
    if (!bound) {
      $(window).keydown(function(event) {
        if (active) {
          var beforeAllocated = active.data('sudoku.allocated');
          var value = event.keyCode - 48;
          allocatabled = true;

          if (1 <= value && value <= 9) {
            applyCells(active, function() {
              if (allocatabled && value == this.data('sudoku.value')) {
                return allocatabled = false;
              }
            });

            if (allocatabled) {
              active.removeClass('sudoku-invalid').
                     data('sudoku.allocated', true);
            }
            else {
              active.addClass('sudoku-invalid').
                     data('sudoku.allocated', false);
            }

            active.text(value).data('sudoku.value', value);
          }
          else if (value == 0) {
            active.text('').
                   data('sudoku.value', 0).
                   data('sudoku.allocated', false);;
          }

          var afterAllocated = active.data('sudoku.allocated');

          if (!beforeAllocated && afterAllocated) {
            allocated++;
          }
          else if (beforeAllocated && !afterAllocated) {
            allocated--;
          }

          if (allocated == 81) {
            $(window).unbind('keydown', arguments.callee);
            alert('Congratulation');
          }
        }
      });

      bound = true;
    }

    var board = $('<div/>').addClass('sudoku-board').appendTo(this);

    for (var y = 0; y < 9; y++) {
      cells.push([]);

      for (var x = 0; x < 9; x++) {
        var cell = $('<div/>').addClass('sudoku-cell').css({
          left: x * 46 + 2 + 'px',
          top:  y * 46 + 2 + 'px'
        }).appendTo(board).data('sudoku.offset', [x, y]);

        cells[y].push(cell);
      }
    }

    initializeBoard(initial);
    initializeHorizontalGroups(cells);
    initializeVerticalGroups(cells);
    initializeBlockGroups(cells);

    return this;
  };
})(jQuery);
