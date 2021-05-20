<template>
  <vue-qr :text="bindwxcode.url" :margin="0" :logo-src="bindwxcode.icon" :logo-scale="0.3" :size="200" />
</template>

<script>
import vueQr from 'vue-qr'
export default {
  components: {
    vueQr
  },
  props: {
    bindwxcode: {
      type: Object,
      default: () => {
        return {
          icon: '',
          url: ''
        }
      }
    }
  }
}
</script>
