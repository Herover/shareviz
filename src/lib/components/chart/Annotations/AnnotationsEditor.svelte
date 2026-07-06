<!-- SPDX-License-Identifier: MPL-2.0 -->

<!--
  Editor section for a chart element's annotation layer. Values can also be
  edited by dragging annotations directly on the chart preview, the fields here
  are for precision and for the parts dragging can't reach (units, colors,
  kinds, the rich text itself).
-->

<script lang="ts">
  import type { Color } from "$lib/chart";
  import type { ChartStore } from "$lib/chartStores/chart.svelte";
  import type { ShareDBConnection } from "$lib/chartStores/data.svelte";
  import ColorPicker from "../ColorPicker/ColorPicker.svelte";
  import PresenceField from "../PresenceField.svelte";
  import RichTextField from "../richText/RichTextField.svelte";
  import {
    AnnotationBoxKind,
    AnnotationUnit,
    defaultBoxAnnotation,
    defaultTextAnnotation,
    type Annotation,
    type AnnotationCoordinate,
  } from "./annotations";

  interface Props {
    /** The element's annotations, undefined when the element predates the field */
    annotations: Annotation[] | undefined;
    /** Element-scoped store, ops are relative to the element data */
    store: ReturnType<typeof ChartStore.prototype.scopeElement>;
    connection: ShareDBConnection;
    /** Element id, used for presence addresses */
    id: string;
    /** Element index in the document, used for rich text document paths */
    elementIndex: number;
    idPrefix?: string;
  }

  let { annotations, store, connection, id, elementIndex, idPrefix = "" }: Props = $props();

  let list = $derived(annotations ?? []);

  const add = (annotation: Annotation) => {
    if (typeof annotations == "undefined") {
      store.submitOp(["annotations", { i: [annotation] }]);
    } else {
      store.submitOp(["annotations", annotations.length, { i: annotation }]);
    }
  };
  const remove = (i: number) => store.submitOp(["annotations", i, { r: 1 }]);

  const setCoordinate = (i: number, key: string, c: AnnotationCoordinate) =>
    store.submitOp(["annotations", i, key, { r: 1, i: c }]);
  const setKind = (i: number, v: string) =>
    store.submitOp(["annotations", i, "kind", { r: 1, i: v }]);
  const setColor = (i: number, c: Color) =>
    store.submitOp(["annotations", i, "color", { r: 1, i: { light: c } }]);
  const setOpacity = (i: number, v: number) =>
    store.submitOp(["annotations", i, "opacity", { r: 1, i: v }]);
  const setTextWidth = (i: number, v: number) =>
    store.submitOp(["annotations", i, "width", { r: 1, i: v }]);

  const kindOptions = [
    { k: AnnotationBoxKind.FREE, l: "Free box" },
    { k: AnnotationBoxKind.VERTICAL_BAND, l: "Full height (vertical band)" },
    { k: AnnotationBoxKind.HORIZONTAL_BAND, l: "Full width (horizontal band)" },
  ];
</script>

{#snippet coordinateRow(
  label: string,
  fieldId: string,
  i: number,
  annotationId: string,
  key: string,
  c: AnnotationCoordinate,
)}
  <div class="editor-row">
    <div class="editor-column-label">
      <label for={fieldId}>{label}</label>
    </div>
    <div>
      <PresenceField
        address={["chart", "elements", id, "d", "annotations", annotationId, key]}
        {connection}
      >
        {#snippet field({ locked })}
          <div class="annotation-coordinate">
            <input
              id={fieldId}
              type="number"
              step="any"
              value={c.v}
              readonly={locked}
              onchange={(e) =>
                setCoordinate(i, key, { ...c, v: Number.parseFloat(e.currentTarget.value) })}
            />
            <select
              aria-label="{label} unit"
              value={c.unit}
              disabled={locked}
              onchange={(e) =>
                setCoordinate(i, key, { ...c, unit: e.currentTarget.value as AnnotationUnit })}
            >
              <option value={AnnotationUnit.DATA}>data value</option>
              <option value={AnnotationUnit.PERCENT}>% of plot</option>
            </select>
          </div>
        {/snippet}
      </PresenceField>
    </div>
  </div>
{/snippet}

{#each list as annotation, i (annotation.id)}
  <div class="annotation-item">
    <div class="annotation-item-head">
      <span>#{i + 1} · {annotation.type == "text" ? "Text" : "Zone box"}</span>
      <button onclick={() => remove(i)}>Delete</button>
    </div>

    {#if annotation.type == "text"}
      <RichTextField
        {connection}
        path={["chart", "elements", elementIndex, "d", "annotations", i, "text"]}
        defaultBlock="p"
      />
      {@render coordinateRow(
        "X position",
        `${idPrefix}annotation-${annotation.id}-x`,
        i,
        annotation.id,
        "x",
        annotation.x,
      )}
      {@render coordinateRow(
        "Y position",
        `${idPrefix}annotation-${annotation.id}-y`,
        i,
        annotation.id,
        "y",
        annotation.y,
      )}
      <div class="editor-row">
        <div class="editor-column-label">
          <label for="{idPrefix}annotation-{annotation.id}-width">Width</label>
          <span class="editor-label-hint">(% of plot)</span>
        </div>
        <div>
          <PresenceField
            address={["chart", "elements", id, "d", "annotations", annotation.id, "width"]}
            {connection}
          >
            {#snippet field({ locked })}
              <input
                id="{idPrefix}annotation-{annotation.id}-width"
                type="number"
                min="5"
                max="100"
                value={annotation.width}
                readonly={locked}
                onchange={(e) => setTextWidth(i, Number.parseFloat(e.currentTarget.value))}
              />
            {/snippet}
          </PresenceField>
        </div>
      </div>
    {:else}
      <div class="editor-row">
        <div class="editor-column-label">
          <label for="{idPrefix}annotation-{annotation.id}-kind">Shape</label>
        </div>
        <div>
          <PresenceField
            address={["chart", "elements", id, "d", "annotations", annotation.id, "kind"]}
            {connection}
          >
            {#snippet field({ locked })}
              <select
                id="{idPrefix}annotation-{annotation.id}-kind"
                value={annotation.kind}
                disabled={locked}
                onchange={(e) => setKind(i, e.currentTarget.value)}
              >
                {#each kindOptions as kind (kind.k)}
                  <option value={kind.k}>{kind.l}</option>
                {/each}
              </select>
            {/snippet}
          </PresenceField>
        </div>
      </div>

      {#if annotation.kind != AnnotationBoxKind.HORIZONTAL_BAND}
        {@render coordinateRow(
          "Left (X1)",
          `${idPrefix}annotation-${annotation.id}-x1`,
          i,
          annotation.id,
          "x1",
          annotation.x1,
        )}
        {@render coordinateRow(
          "Right (X2)",
          `${idPrefix}annotation-${annotation.id}-x2`,
          i,
          annotation.id,
          "x2",
          annotation.x2,
        )}
      {/if}
      {#if annotation.kind != AnnotationBoxKind.VERTICAL_BAND}
        {@render coordinateRow(
          "Bottom (Y1)",
          `${idPrefix}annotation-${annotation.id}-y1`,
          i,
          annotation.id,
          "y1",
          annotation.y1,
        )}
        {@render coordinateRow(
          "Top (Y2)",
          `${idPrefix}annotation-${annotation.id}-y2`,
          i,
          annotation.id,
          "y2",
          annotation.y2,
        )}
      {/if}

      <div class="editor-row">
        <div class="editor-column-label">
          <span>Color</span>
        </div>
        <div>
          <PresenceField
            address={["chart", "elements", id, "d", "annotations", annotation.id, "color"]}
            {connection}
          >
            {#snippet field({ locked })}
              <ColorPicker
                color={annotation.color.light.v}
                disabled={locked}
                onchange={(c) => setColor(i, c)}
              />
            {/snippet}
          </PresenceField>
        </div>
      </div>

      <div class="editor-row">
        <div class="editor-column-label">
          <label for="{idPrefix}annotation-{annotation.id}-opacity">Opacity</label>
          <span class="editor-label-hint">(%)</span>
        </div>
        <div>
          <PresenceField
            address={["chart", "elements", id, "d", "annotations", annotation.id, "opacity"]}
            {connection}
          >
            {#snippet field({ locked })}
              <input
                id="{idPrefix}annotation-{annotation.id}-opacity"
                type="number"
                min="0"
                max="100"
                value={Math.round(annotation.opacity * 100)}
                readonly={locked}
                onchange={(e) => setOpacity(i, Number.parseFloat(e.currentTarget.value) / 100)}
              />
            {/snippet}
          </PresenceField>
        </div>
      </div>
    {/if}
  </div>
{/each}

<button onclick={() => add(defaultTextAnnotation())}>+ Text note</button>
<button onclick={() => add(defaultBoxAnnotation())}>+ Zone box</button>

<style>
  .annotation-item {
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    padding: var(--space-2) var(--space-3);
    margin-bottom: var(--space-2);
  }
  .annotation-item-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--fg-secondary);
    font-size: var(--text-sm);
    margin-bottom: var(--space-1);
  }
  .annotation-coordinate {
    display: flex;
    gap: var(--space-1);
  }
  .annotation-coordinate select {
    width: 40%;
  }
</style>
