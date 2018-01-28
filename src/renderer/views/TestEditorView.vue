<template>
    <div>
        <h1>Test Scenario Editor</h1>
        <CodeEditor @change="onEditorChange"></CodeEditor>
    </div>
</template>

<script>
  import CodeEditor from 'components/CodeEditor';

  export default {
    data() {
      return {
        editorContent: '',
      }
    },
    components: {
      CodeEditor
    },
    methods: {
      onEditorChange (value) {
        this.editorContent = value;
      }
    }
  }
</script>

<style scoped>
</style>
