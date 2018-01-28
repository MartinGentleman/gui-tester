<template>
    <textarea></textarea>
</template>

<script>
    import CodeMirror from 'codemirror/lib/codemirror.js';
    require('codemirror/lib/codemirror.css');
    require('codemirror/addon/edit/closebrackets.js');

    export default {
        props: {
          value: String,
          options: Object,
        },
        data () {
          return {
            editor: null,
            fullOptions: null,
            content: ''
          }
        },
        created () {
          this.fullOptions = this.options || {};
          const options = this.fullOptions;
          options.lineNumbers = options.lineNumbers || true;
          options.lineWrapping = options.lineWrapping || false;
          options.mode = options.mode || {name: 'javascript', json: true};
          options.tabSize = options.tabSize || 2;
          options.theme = options.theme || 'base16-dark';
          options.autoCloseBrackets = options.autoCloseBrackets || true;

          const mode = options.mode.name || options.mode;
          require(`codemirror/mode/${mode}/${mode}.js`);
          require(`codemirror/theme/${options.theme}.css`);
        },
        mounted () {
          const _this = this;
          this.editor = CodeMirror.fromTextArea($('textarea')[0], this.fullOptions);
          this.editor.setValue(this.value || '');
          this.editor.on('change', cm => {
            _this.content = cm.getValue();
            if (!!_this.$emit) {
              _this.$emit('change', _this.content);
              _this.$emit('input', _this.content);
            }
          });
          const events = [
            'changes',
            'beforeChange',
            'cursorActivity',
            'keyHandled',
            'inputRead',
            'electricInput',
            'beforeSelectionChange',
            'viewportChange',
            'swapDoc',
            'gutterClick',
            'gutterContextMenu',
            'focus',
            'blur',
            'refresh',
            'optionChange',
            'scrollCursorIntoView',
            'update'
          ];
          events.forEach(event =>
            _this.editor.on(event, (a, b, c) =>
              _this.$emit(event, a, b, c)
            )
          );
          this.$emit('ready', this.editor);
        },
        beforeDestroy: function() {
          // garbage cleanup
          this.editor.doc.cm.getWrapperElement().remove();
        },
        watch: {
          options: {
            deep: true,
            handler (options) {
                options.forEach(key => this.editor.setOption(key, options[key]));
            }
          },
          value (newVal) {
            const editor_value = this.editor.getValue();
            if (newVal !== editor_value) {
              const scrollInfo = this.editor.getScrollInfo();
              this.editor.setValue(newVal);
              this.content = newVal;
              this.editor.scrollTo(scrollInfo.left, scrollInfo.top);
            }
          }
        }
    }
</script>

<style scoped>
</style>
