<script lang="ts">
  import { svelteCookieStore } from '../svelte-cookie-store';

  interface Props {
    name?: string;
    filterName?: string;
  }

  const { name, filterName }: Props = $props();

  const cookie = $derived.by(() => (name ? svelteCookieStore.get(name) : null));
  const cookies = $derived.by(() => svelteCookieStore.getAll(filterName));
</script>

{#if name}
  <div data-testid="cookie-value">{cookie?.value ?? 'null'}</div>
{:else}
  <div data-testid="cookies-length">{cookies.length}</div>
{/if}
