<script setup lang="ts">
type EcosystemLink = {
  title: string
  description: string
  icon: 'snapshot' | 'mux' | 'defillama' | 'medium' | 'tally' | 'dune' | 'regen'
  href: string
}

const governanceLinks: EcosystemLink[] = [
  {
    title: 'Snapshot',
    description: 'Vote on MUX proposals and participate in the MUX governance process.',
    icon: 'snapshot',
    href: 'https://snapshot.org/#/muxofficial.eth',
  },
  {
    title: 'MUX Forum',
    description: 'Join community discussions surrounding various MUX governance proposals.',
    icon: 'mux',
    href: 'https://forum.mux.network/',
  },
  {
    title: 'DefiLlama',
    description: 'View MUX metrics including TVL, protocol fees, users, valuation and more.',
    icon: 'defillama',
    href: 'https://defillama.com/',
  },
  {
    title: 'MUX Medium Articles',
    description: 'Read MUX protocol updates and learn milestones & key metrics from the ecosystem.',
    icon: 'medium',
    href: 'https://medium.com/@muxprotocol',
  },
  {
    title: 'Tally',
    description: 'Delegate $ARB voting power to MUX and participate in the Arbitrum governance process.',
    icon: 'tally',
    href: 'https://www.tally.xyz/',
  },
  {
    title: 'Dune Analytics',
    description: 'View MUX metrics, including volume, protocol income, users, funding rates and more.',
    icon: 'dune',
    href: 'https://dune.com/',
  },
]

const communityProjects: EcosystemLink[] = [
  {
    title: 'Regen',
    description: 'Use the future yield of your GLP to open leveraged ETH positions on MUX .',
    icon: 'regen',
    href: 'https://regen.universe/',
  },
]

const iconSources: Partial<Record<EcosystemLink['icon'], string>> = {
  defillama: 'http://localhost:3845/assets/12e8f89a8b4251b732245316a00ab89792a3c524.png',
  regen: 'http://localhost:3845/assets/8946b0cbeaf34d8f101fb48d9c8a7d520d632e88.png',
}
</script>

<template>
  <section class="mx-auto mt-4 flex w-full max-w-[1160px] flex-col gap-12 px-4 text-[var(--hp-white-color)] sm:px-6">
    <div class="flex flex-col gap-6">
      <header class="flex flex-col gap-2">
        <h1 class="text-2xl font-semibold leading-8">Governance &amp; Updates</h1>
        <p class="max-w-[816px] text-sm leading-5 text-[var(--hp-text-color)]">
          Websites related to MUX governance process, protocol updates and deployed ecosystem governance.
        </p>
      </header>

      <div class="grid gap-4 md:grid-cols-3">
        <article
          v-for="link in governanceLinks"
          :key="link.title"
          class="flex h-full flex-col gap-5 bg-[var(--hp-bg-normal)] px-6 pb-6 pt-5"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--hp-bg-light)]"
              :class="{
                'bg-[#f6a528] text-[var(--hp-black-color)]': link.icon === 'snapshot',
                'bg-[#0f1f3d] text-white': link.icon === 'mux',
                'bg-[#111214] text-white': link.icon === 'medium',
                'bg-[#6c5dd3] text-white': link.icon === 'tally',
              }"
              :style="link.icon === 'dune' ? { background: 'linear-gradient(135deg,#f77e39 0 50%,#1c2d71 50% 100%)' } : {}"
            >
              <img
                v-if="iconSources[link.icon]"
                :src="iconSources[link.icon]"
                :alt="`${link.title} icon`"
                class="h-8 w-8 rounded-full object-contain"
                loading="lazy"
              />
              <svg
                v-else-if="link.icon === 'snapshot'"
                aria-hidden="true"
                viewBox="0 0 24 24"
                class="h-5 w-5"
                fill="currentColor"
              >
                <path d="m12 3-2 7h4l-2 7" />
              </svg>
              <span v-else-if="link.icon === 'mux'" class="text-xs font-semibold tracking-wide">MUX</span>
              <span v-else-if="link.icon === 'medium'" class="text-xs font-semibold">M</span>
              <span v-else-if="link.icon === 'tally'" class="text-xs font-semibold">T</span>
            </div>
            <a
              :href="link.href"
              target="_blank"
              rel="noreferrer"
              class="group inline-flex items-center gap-2 text-base font-semibold leading-6"
            >
              <span class="group-hover:text-[var(--hp-primary-green)]">{{ link.title }}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                class="h-4 w-4 text-[var(--hp-text-color)] transition group-hover:text-[var(--hp-primary-green)]"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 15 15 9" />
                <path d="m10 9h5v5" />
                <path d="M5 19 19 5" />
              </svg>
            </a>
          </div>
          <p class="text-sm leading-5 text-[var(--hp-text-color)]">{{ link.description }}</p>
        </article>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <header class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold leading-8">Community Projects</h2>
        <p class="text-sm leading-5 text-[var(--hp-text-color)]">Ecosystem projects that have integrated with MUX.</p>
      </header>

      <div class="grid gap-4 md:grid-cols-3">
        <article
          v-for="link in communityProjects"
          :key="link.title"
          class="flex h-full flex-col gap-5 bg-[var(--hp-bg-normal)] px-6 pb-6 pt-5"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--hp-bg-light)]">
              <img
                v-if="iconSources[link.icon]"
                :src="iconSources[link.icon]"
                :alt="`${link.title} icon`"
                class="h-8 w-8 rounded-full object-contain"
                loading="lazy"
              />
              <span v-else class="text-xs font-semibold">{{ link.title[0] }}</span>
            </div>
            <a
              :href="link.href"
              target="_blank"
              rel="noreferrer"
              class="group inline-flex items-center gap-2 text-base font-semibold leading-6"
            >
              <span class="group-hover:text-[var(--hp-primary-green)]">{{ link.title }}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                class="h-4 w-4 text-[var(--hp-text-color)] transition group-hover:text-[var(--hp-primary-green)]"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 15 15 9" />
                <path d="m10 9h5v5" />
                <path d="M5 19 19 5" />
              </svg>
            </a>
          </div>
          <p class="text-sm leading-5 text-[var(--hp-text-color)]">{{ link.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
