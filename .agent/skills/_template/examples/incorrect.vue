<script>
/**
 * Anti-Pattern Example: Everything wrong in one file.
 *
 * ❌ Options API (not Composition API)
 * ❌ Hardcoded hex colors
 * ❌ No TypeScript
 * ❌ No ARIA / accessibility
 * ❌ Raw HTML instead of UI components
 * ❌ Deep CSS pseudo-selectors (violates ADR-001)
 * ❌ any types
 * ❌ Prop mutation
 */
export default {
  props: {
    title: String,           // ❌ No type interface
    variant: String,
    disabled: Boolean,       // ❌ Wrong prop name (should be isDisabled)
  },
  data() {
    return { inputVal: '' }
  },
  methods: {
    submit() {
      this.title = 'changed'  // ❌ Mutating prop directly
      this.$emit('submit')     // ❌ Not typed, not past-tense
    },
  },
}
</script>

<template>
  <div style="padding: 24px; background: #1C1B1F;">
    <!-- ❌ Hardcoded hex, no semantic HTML, no aria -->
    <h2 style="color: #ffffff;">{{ title }}</h2>

    <input
      v-model="inputVal"
      class="[&>input]:!bg-[#f5f5f5]"
    />
    <!-- ❌ Deep CSS pseudo-selector (ADR-001 violation) -->
    <!-- ❌ Raw <input> instead of <s-input> -->

    <button
      class="bg-[#6750A4] text-white px-4 py-2"
      :disabled="disabled"
      @click="submit"
    >
      Submit
    </button>
    <!-- ❌ Raw <button> instead of <s-button> -->
    <!-- ❌ disabled instead of isDisabled -->
  </div>
</template>
