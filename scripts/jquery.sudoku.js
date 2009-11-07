(function($) {
  var active = null;
  var bound = false;

  var initialize = function(initial) {
    var board = $('<div/>').addClass('sudoku-board');
    var deployed = 0;

    var rows = xmap(function(row, column) {
      var value = parseInt(initial.charAt(row * 9 + column), 10);
      var cell = create(row, column, value);
      if (cell.data('sudoku').deployed) deployed++;
      return [row, column, cell.appendTo(board)];
    });

    var columns = xmap(function(row, column) {
      return [column, row, rows[row][column]];
    });

    var blocks = xmap(function(row, column) {
      var i = Math.floor(row / 3) * 3 + Math.floor(column / 3);
      var j = (row % 3) * 3 + column % 3;
      return [i, j, rows[row][column]];
    });

    var apply = function(cell, iterator) {
      var data = cell.data('sudoku');
      var row = data.row;
      var column = data.column;
      var block = Math.floor(row / 3) * 3 + Math.floor(column / 3);

      $.each(rows[row], iterator);
      $.each(columns[column], iterator);
      $.each(blocks[block], iterator);
    };

    return board.data('sudoku', {
      rows:     rows,
      columns:  columns,
      blocks:   blocks,
      deployed: deployed,
      apply:    apply
    });
  };

  var create = function(row, column, value) {
    var cell = $('<div/>').addClass('sudoku-cell').css({
      left: column * 46 + 2,
      top:  row    * 46 + 2
    });

    if (value > 0) {
      cell.addClass('sudoku-frozen').text(value);
    }
    else {
      cell.click(function() {
        if (active) deactivate(active);
        active = $(this).addClass('sudoku-active');
        apply(active, function() { this.addClass('sudoku-group') });
      });
    }

    return cell.data('sudoku', {
      row:      row,
      column:   column,
      value:    value,
      frozen:   value > 0,
      deployed: value > 0
    });
  };

  var complete = function(board) {
    var rows = board.data('sudoku').rows;
    xmap(function(row, column) { rows[row][column].unbind('click') });
    if (active) deactivate(active);
    active = null;
    alert('Congratulation');
  };

  var deactivate = function(cell) {
    cell.removeClass('sudoku-active');
    apply(cell, function() { this.removeClass('sudoku-group') });
    if (!cell.data('sudoku').deployed) clear(cell);
  };

  var clear = function(cell) {
    var data = cell.data('sudoku');
    data.value = 0;
    data.deployed = false;
    return cell.removeClass('sudoku-invalid').text('');
  };

  var apply = function(cell, iterator) {
    cell.parent('div.sudoku-board').data('sudoku').apply(cell, iterator);
  };

  var xmap = function(iterator) {
    var items = [];

    for (var row = 0; row < 9; row++) {
      for (var column = 0; column < 9; column++) {
        result = iterator(row, column);
        if (!result) continue;
        var i = result[0];
        var j = result[1];
        if (!items[i]) items[i] = [];
        items[i][j] = result[2];
      }
    }

    return items;
  };

  $.fn.sudoku = function(initial) {
    if (!bound) {
      $(window).keydown(function(event) {
        if (!active) return;

        var data = active.data('sudoku');
        if (data.frozen) return;

        var value = event.keyCode - 48;
        if (value < 0 || 9 < value) return;

        var before = data.deployed;

        if (value == 0) {
          clear(active);
        }
        else {
          var deployed = true;

          apply(active, function() {
            if (deployed && value == this.data('sudoku').value) {
              return deployed = false;
            }
          });

          data.value = value;
          data.deployed = deployed;

          active[deployed ? 'removeClass' : 'addClass']('sudoku-invalid').
                text(value);
        }

        var after = data.deployed;
        var board = active.parent('div.sudoku-board');
        var boardData = board.data('sudoku');

        if      (!before &&  after) boardData.deployed++;
        else if ( before && !after) boardData.deployed--;

        if (boardData.deployed == 81) complete(board);
      });

      bound = true;
    }

    var board = initialize(initial).appendTo(this);
    if (board.data('sudoku').deployed == 81) complete(board);
    return this;
  };
})(jQuery);
