<script setup lang="ts">
import routes from 'weapp-vite/auto-routes'
import { onLaunch } from 'wevu'

onLaunch(() => {
  console.log('[z-paging-wevu demo] launch')
})

defineAppJson({
  pages: routes.pages,
  window: {
    navigationBarTitleText: 'z-paging-wevu',
    navigationBarBackgroundColor: '#f8f8f8',
    navigationBarTextStyle: 'black',
    backgroundTextStyle: 'dark',
  },
  style: 'v2',
})
</script>

<style src="./app.css"></style>
