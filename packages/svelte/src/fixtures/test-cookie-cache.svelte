<script lang="ts">
  import { cookieStoreCache } from '../cookie-cache';

  interface Props {
    name?: string;
    filterName?: string;
  }

  const { name, filterName }: Props = $props();

  // Reactive cookie value using $derived
  const cookie = $derived(name ? cookieStoreCache.get(name) : null);
  const cookies = $derived(cookieStoreCache.getAll(filterName));
</script>

{#if name}
  <div data-testid="cookie-value">{cookie?.value ?? 'null'}</div>
{:else}
  <div data-testid="cookies-length">{cookies.length}</div>
{/if}
