<script setup lang="ts">
import { useCookies } from '../use-cookie';

const props = defineProps<{
  names?: string[];
}>();

const cookies = useCookies(props.names);
</script>

<template>
  <div data-testid="cookies-size">{{ cookies.size }}</div>
</template>
