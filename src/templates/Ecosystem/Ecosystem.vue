<script setup lang="ts">
import EcosystemTestIcon from '@/assets/icons/ecosystem-test.svg'
import LinkIcon from '@/assets/icons/link.svg'

type EcosystemLink = {
  title: string
  description: string
  icon: any
  href: string
}

const governanceLinks: EcosystemLink[] = [
  {
    title: 'Snapshot',
    description: 'Vote on MUX proposals and participate in the MUX governance process.',
    icon: EcosystemTestIcon,
    href: 'https://snapshot.org/#/muxofficial.eth',
  },
  {
    title: 'MUX Forum',
    description: 'Join community discussions surrounding various MUX governance proposals.',
    icon: EcosystemTestIcon,
    href: 'https://forum.mux.network/',
  },
  {
    title: 'DefiLlama',
    description: 'View MUX metrics including TVL, protocol fees, users, valuation and more.',
    icon: EcosystemTestIcon,
    href: 'https://defillama.com/',
  },
  {
    title: 'MUX Medium Articles',
    description: 'Read MUX protocol updates and learn milestones & key metrics from the ecosystem.',
    icon: EcosystemTestIcon,
    href: 'https://medium.com/@muxprotocol',
  },
  {
    title: 'Tally',
    description: 'Delegate $ARB voting power to MUX and participate in the Arbitrum governance process.',
    icon: EcosystemTestIcon,
    href: 'https://www.tally.xyz/',
  },
  {
    title: 'Dune Analytics',
    description: 'View MUX metrics, including volume, protocol income, users, funding rates and more.',
    icon: EcosystemTestIcon,
    href: 'https://dune.com/',
  },
]

const communityProjects: EcosystemLink[] = [
  {
    title: 'Regen',
    description: 'Use the future yield of your GLP to open leveraged ETH positions on MUX .',
    icon: EcosystemTestIcon,
    href: 'https://regen.universe/',
  },
]
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
            <img :src="EcosystemTestIcon" class="h-[32px] w-[32px]" />
            <a
              :href="link.href"
              target="_blank"
              rel="noreferrer"
              class="group inline-flex items-center gap-2 text-base font-semibold leading-6"
            >
              <span class="group-hover:text-[var(--hp-primary-green)]">{{ link.title }}</span>
              <span
                class="icon-mask !w-[16px] !h-[16px] !text-[var(--hp-text-color)] group-hover:!text-[var(--hp-primary-green)]"
                :style="{
                  '--icon-url': `url(${LinkIcon})`,
                }"
              />
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
            <img :src="EcosystemTestIcon" class="h-[32px] w-[32px]" />
            <a
              :href="link.href"
              target="_blank"
              rel="noreferrer"
              class="group inline-flex items-center gap-2 text-base font-semibold leading-6"
            >
              <span class="group-hover:text-[var(--hp-primary-green)]">{{ link.title }}</span>
              <span
                class="icon-mask !w-[16px] !h-[16px] !text-[var(--hp-text-color)] group-hover:!text-[var(--hp-primary-green)]"
                :style="{
                  '--icon-url': `url(${LinkIcon})`,
                }"
              />
            </a>
          </div>
          <p class="text-sm leading-5 text-[var(--hp-text-color)]">{{ link.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
