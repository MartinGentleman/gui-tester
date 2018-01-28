<template>
    <div v-if="targets && targets.length > 0" id="TestTargetPickerComponent">
        <div v-for='target in targets' class='ui segment'>
            <div class='ui child checkbox'>
                <input type='checkbox' @change='onChange' :name='target' :checked='!unpickedRouteTargets[$route.name].includes(target)' />
                <label>{{target}}</label>
            </div>
        </div>
    </div>
</template>

<script>
  const getCheckedCheckboxes = () => {
    const checked = [];
    $('[type="checkbox"]:checked').each((index, checkbox) => {
      checked.push(checkbox.name);
    });
    return checked;
  };

  const getUncheckedCheckboxes = () => {
    const unchecked = [];
    $('[type="checkbox"]:not(:checked)').each((index, checkbox) => {
      unchecked.push(checkbox.name);
    });
    return unchecked;
  };

  export default {
    props: ['targets'],
    data () {
      return {
        unpickedRouteTargets: {}
      }
    },
    watch: {
      '$route.name' () {
        if (!this.unpickedRouteTargets[this.$route.name]) {
          this.unpickedRouteTargets[this.$route.name] = [];
        }
      }
    },
    methods: {
      onChange () {
        this.unpickedRouteTargets[this.$route.name] = getUncheckedCheckboxes();
        this.$emit('pickedTargetsUpdated', getCheckedCheckboxes());
      }
    },
    mounted () {
      this.unpickedRouteTargets[this.$route.name] = [];
    },
    updated () {
      this.$emit('pickedTargetsUpdated', getCheckedCheckboxes());
    }
  }
</script>

<style scoped>
</style>
