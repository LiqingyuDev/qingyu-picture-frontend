<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import { healthCheckUsingGet } from '@/api/mainController.ts'


healthCheckUsingGet().then(res=>{
  console.log(res.data.data)
})


</script>

<template>
  <div class="homePage">
  <TheWelcome />
  </div>
</template>
