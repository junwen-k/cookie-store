<script setup lang="ts">
import { useCookies } from '../use-cookie';

const props = defineProps<{
  name?: string;
}>();

const cookies = useCookies(props.name);
</script>

<template>
  <div data-testid="cookies-length">{{ cookies.length }}</div>
</template>
