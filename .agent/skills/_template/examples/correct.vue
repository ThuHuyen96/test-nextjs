<script setup lang="ts">
/**
 * Golden Example: Correct component following all project standards.
 *
 * ✅ Composition API with <script setup>
 * ✅ Typed props with withDefaults
 * ✅ Typed emits with past-tense verbs
 * ✅ Design tokens (no hardcoded hex)
 * ✅ Semantic HTML with ARIA
 * ✅ Stove UI / ZeroUI components
 */

interface Props {
  title: string
  variant?: 'primary' | 'secondary'
  isDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  isDisabled: false,
})

const emit = defineEmits<{
  submitted: [value: string]
  cancelled: []
}>()

const model = defineModel<string>({ default: '' })

function handleSubmit() {
  if (!props.isDisabled) {
    emit('submitted', model.value)
  }
}
</script>

<template>
  <section
    class="flex flex-col gap-16 p-24 bg-surface-elevation-1 rounded-12"
    aria-labelledby="form-title"
  >
    <h2
      id="form-title"
      class="text-title-medium text-on-surface"
    >
      {{ title }}
    </h2>

    <div class="flex gap-12">
      <s-input
        v-model="model"
        placeholder="Enter value"
        :is-disabled="isDisabled"
        :class="!isDisabled ? '!bg-neutral-variant-3' : ''"
        aria-label="Input field"
      />

      <s-button
        :variant="variant"
        size="md"
        :is-disabled="isDisabled"
        @click="handleSubmit"
      >
        Submit
      </s-button>
    </div>
  </section>
</template>
