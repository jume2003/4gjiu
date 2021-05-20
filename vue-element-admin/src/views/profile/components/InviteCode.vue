<template>
  <vue-qr :text="invitecode.url" :margin="0" :logo-src="invitecode.icon" :logo-scale="0.3" :size="200" />
</template>

<script>
import vueQr from 'vue-qr'
export default {
  components: {
    vueQr
  },
  props: {
    invitecode: {
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
