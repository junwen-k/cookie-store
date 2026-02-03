<script setup lang="ts">
import { useCookie } from '../use-cookie';

const props = defineProps<{
  name: string;
}>();

const cookie = useCookie(props.name);
</script>

<template>
  <div data-testid="cookie-value">{{ cookie?.value || 'null' }}</div>
</template>
