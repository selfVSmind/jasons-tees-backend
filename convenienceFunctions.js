module.exports = {
// https://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
    prettyConsoleJson: function prettyConsoleJson(json) {
      if (typeof json !== 'string') {
        json = JSON.stringify(json, undefined, 2);
      }
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, 
        function (match) {
          let cls = "\x1b[36m";
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = "\x1b[34m";
            } else {
              cls = "\x1b[32m";
            }
          } else if (/true|false/.test(match)) {
            cls = "\x1b[35m"; 
          } else if (/null/.test(match)) {
            cls = "\x1b[31m";
          }
          return cls + match + "\x1b[0m";
        }
      );
    },
    
    syntaxHighlight: function syntaxHighlight(json) {
        if (typeof json != 'string') {
             json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    },
    
    makeNice: function makeNice(json) {
        if (typeof json != 'string') {
            json = JSON.stringify(json, undefined, '\t');
        }
    
        var 
            arr = [],
            _string = 'color:green',
            _number = 'color:darkorange',
            _boolean = 'color:blue',
            _null = 'color:magenta',
            _key = 'color:red';
    
        json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var style = _number;
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    style = _key;
                } else {
                    style = _string;
                }
            } else if (/true|false/.test(match)) {
                style = _boolean;
            } else if (/null/.test(match)) {
                style = _null;
            }
            arr.push(style);
            arr.push('');
            return '%c' + match + '%c';
        });
    
        arr.unshift(json);
    
        console.log.apply(console, arr);
    }
};