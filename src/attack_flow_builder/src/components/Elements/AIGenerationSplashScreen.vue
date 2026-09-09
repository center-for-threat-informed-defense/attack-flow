<template>
  <!--
    Minimal generate-flow shell.
    Runtime provider state is owned by the session-local runtime provider store,
    and this shell is the minimal entry surface for Direct Provider Mode.
    Raw text and PDF-derived text both normalize into the same browser-side
    package here, without paraphrasing or semantic rewriting.
  -->
  <div class="ai-generation">
    <div>
      <button
        class="back-button"
        @click="onClickBack"
      >
        <ArrowLeftIcon
          :width="10"
          :height="10"
          :color="iconColor"
        />
        Back
      </button>
    </div>
    <h2 class="generation-title">
      Generate Attack Flow
    </h2>
    <div
      class="section source-type"
      :style="apiHealthCheckInProgress ? 'visibility: hidden' : ''"
    >
      <p class="section-title">
        SOURCE TYPE
      </p>
      <div
        class="button-grid source-type-grid"
        role="radiogroup"
        aria-label="Source type"
      >
        <div
          :class="['button', 'source-type-button', { selected: sourceType === 'upload' }]"
          role="radio"
          :aria-checked="sourceType === 'upload'"
          tabindex="0"
          @click="selectSourceType('upload')"
          @keydown.enter="selectSourceType('upload')"
          @keydown.space.prevent="selectSourceType('upload')"
        >
          <div
            class="button-header"
          >
            <span class="button-icon"><EmptyPageIcon /></span>
            <p class="button-title">
              Upload Report PDF
            </p>
          </div>
          <p class="button-description">
            Create a flow from a security incident report PDF.
          </p>
        </div>
        <div
          :class="['button', 'source-type-button', { selected: sourceType === 'url' }]"
          role="radio"
          :aria-checked="sourceType === 'url'"
          tabindex="0"
          @click="selectSourceType('url')"
          @keydown.enter="selectSourceType('url')"
          @keydown.space.prevent="selectSourceType('url')"
        >
          <div class="button-header">
            <span class="button-icon"><LinkIcon /></span>
            <p class="button-title">
              Link to Report
            </p>
          </div>
          <p class="button-description">
            Paste a link to an incident report blog.
          </p>
        </div>
        <div
          :class="['button', 'source-type-button', { selected: sourceType === 'text' }]"
          role="radio"
          :aria-checked="sourceType === 'text'"
          tabindex="0"
          @click="selectSourceType('text')"
          @keydown.enter="selectSourceType('text')"
          @keydown.space.prevent="selectSourceType('text')"
        >
          <div class="button-header">
            <span class="button-icon"><FolderIcon /></span>
            <p class="button-title">
              Paste Text
            </p>
          </div>
          <p class="button-description">
            Paste an incident report as plain text.
          </p>
        </div>
      </div>
      <div class="form-field source-data-field">
        <span class="section-title">SOURCE DATA</span>
        <div
          v-if="sourceType === 'upload'"
          class="source-upload-control"
        >
          <input
            :value="sourceFileName"
            type="text"
            placeholder="Select a PDF report."
            aria-label="Selected PDF report"
            disabled
          >
          <button
            class="source-upload-button"
            type="button"
            @click="openSourceFileDialog"
          >
            {{ sourceFile ? "Change PDF" : "Choose PDF" }}
          </button>
        </div>
        <input
          v-else-if="sourceType === 'url'"
          v-model="sourceUrl"
          type="url"
          placeholder="https://example.com/report"
          aria-label="Report URL"
          :aria-invalid="!!sourceUrl.trim() && !isSourceUrlValid"
          @keydown.stop
        >
        <textarea
          v-else-if="sourceType === 'text'"
          v-model="sourceText"
          rows="3"
          placeholder="Paste incident report text."
          aria-label="Report text"
          @keydown.stop
        />
        <input
          v-else
          type="text"
          aria-label="Source data"
          disabled
        >
        <input
          ref="sourceFileInput"
          class="file-input"
          type="file"
          accept=".pdf,application/pdf"
          @change="onSourceFileSelected"
        >
      </div>
      <div
        v-if="apiHealthCheckSucceeded"
        class="section llm-information"
      >
        <details>
          <summary class="section-title">
            <span>
              LLM OVERRIDES <small>(optional)</small>
            </span>
          </summary>
          <div class="llm-container">
            <label
              class="form-field"
              style="flex: 1;"
            >
              <span>TYPE:</span>
              <AIGenerationProviderType
                v-model="llmType"
                :provider-types="RUNTIME_PROVIDER_OVERRIDE_TYPES"
              />
            </label>
            <label
              class="form-field"
              style="flex: 2;"
            >
              <span>ENDPOINT:</span>
              <input
                v-model="llmEndpoint"
                type="text"
                placeholder="LLM endpoint override"
                @keydown.stop
              >
            </label>
            <label
              class="form-field"
              style="flex: 2;"
            >
              <span>TOKEN:</span>
              <input
                v-model="llmToken"
                type="password"
                placeholder="LLM token override"
                @keydown.stop
              >
            </label>
          </div>
          <div
            v-if="llmType"
            class="llm-container llm-override-details"
          >
            <label
              v-if="llmType !== 'azure_openai'"
              class="form-field"
              style="flex: 1;"
            >
              <span>MODEL:</span>
              <input
                v-model="llmModel"
                type="text"
                placeholder="Provider model"
                @keydown.stop
              >
            </label>
            <template v-else>
              <label
                class="form-field"
                style="flex: 1;"
              >
                <span>AZURE DEPLOYMENT:</span>
                <input
                  v-model="llmAzureDeployment"
                  type="text"
                  placeholder="Azure deployment name"
                  @keydown.stop
                >
              </label>
              <label
                class="form-field"
                style="flex: 1;"
              >
                <span>AZURE API VERSION:</span>
                <input
                  v-model="llmAzureApiVersion"
                  type="text"
                  placeholder="2025-04-01-preview"
                  @keydown.stop
                >
              </label>
            </template>
          </div>
        </details>
      </div>
      <div
        v-else
        class="section llm-information"
      >
        <p class="section-title">
          LLM INFORMATION
        </p>
        <div class="llm-grid">
          <label class="form-field">
            <span>PROVIDER TYPE:</span>
            <AIGenerationProviderType
              v-model="llmType"
              :provider-types="SUPPORTED_RUNTIME_PROVIDER_TYPES"
            />
          </label>
          <label class="form-field">
            <span>ENDPOINT:</span>
            <input
              v-model="llmEndpoint"
              type="text"
              @keydown.stop
            >
          </label>
          <label class="form-field">
            <span>TOKEN:</span>
            <input
              v-model="llmToken"
              type="password"
              @keydown.stop
            >
          </label>
          <label class="form-field">
            <span>MODEL / DEPLOYMENT:</span>
            <input
              v-model="llmModel"
              type="text"
              placeholder="gpt-4o-mini"
              @keydown.stop
            >
            <small class="field-hint">
              For Claude, Gemini, or Azure OpenAI, enter the model name.
            </small>
          </label>
          <div
            v-if="supportsAzureSettings"
            class="form-field azure-toggle-field"
          >
            <span>AZURE:</span>
            <label class="switch-row">
              <span class="switch-label">Use Azure settings</span>
              <span class="switch-control">
                <input
                  v-model="llmUseAzure"
                  class="switch-input"
                  type="checkbox"
                >
                <span
                  class="switch-track"
                  aria-hidden="true"
                />
              </span>
            </label>
          </div>
          <label
            v-if="supportsAzureSettings && llmUseAzure"
            class="form-field"
          >
            <span>AZURE API VERSION:</span>
            <input
              v-model="llmAzureApiVersion"
              type="text"
              placeholder="2025-04-01-preview"
              @keydown.stop
            >
          </label>
        </div>
      </div>
      <button
        class="generate-button"
        type="button"
        :disabled="!canGenerate || generationStatus === 'loading'"

        @click="onClickGenerate"
      >
        GENERATE
      </button>
      <p
        v-if="generationMessage && generationStatus !== 'idle'"
        class="generation-message"
        :data-status="generationStatus"
      >
        {{ generationMessage }}
      </p>
    </div>

    <div
      v-if="apiHealthCheckInProgress"
      class="health-check-loading-indicator"
    >
      <LoadingSpinner
        label="Detecting API"
      />
      <small>Detecting API...</small>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useApplicationStore } from "@/stores/ApplicationStore";
import { useRuntimeProviderStore } from "@/stores/RuntimeProviderStore";
import LinkIcon from "@/components/Icons/LinkIcon.vue";
import FolderIcon from "@/components/Icons/FolderIcon.vue";
import EmptyPageIcon from "@/components/Icons/EmptyPageIcon.vue";
import {
    fetchJobResultArtifact,
    RUNTIME_PROVIDER_OVERRIDE_TYPES,
    runJobToResult,
    type RuntimeProviderOverrideType,
} from "@/api/jobs";
import { fetchHealthCheck } from "@/api/health.ts";
import {
  BrowserPdfExtractionService,
  PdfExtractionServiceError,
  normalizePdfExtractionFailure,
  type PdfExtractionError,
  type PdfExtractionResult,
  type PdfExtractionState
} from "@/assets/scripts/Application/PdfExtraction";
import {
  normalizePdfExtractionInput,
  normalizeRawTextInput,
  type NormalizedInputPackage
} from "@/assets/scripts/Application/InputNormalization";
import { prepareDirectProviderUrlInput } from "@/assets/scripts/Application/UrlExtraction";
import {
  buildDirectProviderRequestPipeline,
  type DirectProviderRequestPipelineParams
} from "@/assets/scripts/Application/PromptOrchestration";
import {
  buildStructuredExtractionFailureDisplayState,
  validateAndRepairStructuredExtractionOutput,
  type StructuredExtractionFailureDisplayState,
  type StructuredExtractionRepairResult
} from "@/assets/scripts/Application/StructuredExtraction";
import { prepareEditorFromValidatedStructuredExtraction } from "@/assets/scripts/Application/Commands";
import { AiSdkProviderAdapter, type StructuredGenerationRequest } from "@/assets/scripts/Application/Providers";
import {
  SUPPORTED_RUNTIME_PROVIDER_TYPES,
  type SupportedRuntimeProviderType
} from "@/assets/scripts/Application/Configuration";
import { prepareEditorFromExistingFile } from "@/assets/scripts/Application/index.ts";
import LoadingSpinner from "./LoadingSpinner.vue";
import AIGenerationProviderType from "./AIGenerationProviderType.vue";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon.vue";

type SourceType = "upload" | "url" | "text" | null;

interface DirectProviderStructuredGenerationOutputLite {
  outputJson?: unknown;
  outputText?: string;
  providerId?: string;
  model?: string;
  finishReason?: string;
}

export default defineComponent({
  name: "AIGenerationSplashScreen",
  emits: ['onClickBack'],
  setup() {
    return {
        applicationStore: useApplicationStore(),
        runtimeProviderStore: useRuntimeProviderStore(),
        RUNTIME_PROVIDER_OVERRIDE_TYPES,
        SUPPORTED_RUNTIME_PROVIDER_TYPES
    }
  },
  data() {
    return {
      sourceType: null as SourceType,
      sourceFile: null as File | null,
      sourceFileName: "",
      pdfExtractionRequestId: 0,
      pdfExtractionState: { status: "idle" } as PdfExtractionState,
      pdfExtractionResult: null as PdfExtractionResult | null,
      pdfExtractionError: null as PdfExtractionError | null,
      directProviderStructuredGenerationOutput: null as DirectProviderStructuredGenerationOutputLite | null,
      generationStatus: "idle" as "idle" | "loading" | "success" | "error",
      generationMessage: "",
      sourceUrl: "",
      sourceText: "",
      llmType: "" as RuntimeProviderOverrideType | "",
      llmEndpoint: "",
      llmToken: "",
      apiHealthCheckInProgress: false,
      apiHealthCheckSucceeded: false,
      llmModel: "",
      llmUseAzure: false,
      llmAzureDeployment: "",
      llmAzureApiVersion: ""
    }
  },
  computed: {

    /**
     * Returns the normalized input package for the current direct-provider
     * source, using deterministic cleanup and preserving practical metadata.
     * @returns
     *  The shared normalized input package or null when no usable source text
     *  is available.
     */
    normalizedInputPackage(): NormalizedInputPackage | null {
      if (this.sourceType === "text") {
        const text = this.sourceText.trim();
        if (!text) {
          return null;
        }

        return normalizeRawTextInput(this.sourceText, {
          sourceName: "Pasted Text"
        });
      }

      if (this.sourceType === "upload" && this.pdfExtractionResult) {
        return normalizePdfExtractionInput(this.pdfExtractionResult, {
          sourceName: "PDF Upload"
        });
      }

      return null;
    },

    /**
     * Returns the provider-agnostic structured generation request for the
     * current direct-provider input when the minimal provider context exists.
     * This exposes the assembled request only; it does not send the request.
     */
    directProviderStructuredGenerationRequest(): StructuredGenerationRequest | null {
      const normalizedInput = this.normalizedInputPackage;
      const runtimeProviderConfig = this.runtimeProviderStore.runtimeProviderConfig;

      const model = this.llmModel.trim();
      if (!normalizedInput || !model) {
        return null;
      }

      const providerEndpoint = this.llmEndpoint.trim();
      const providerApiKey = this.llmToken.trim();
      const azureApiVersion = this.llmAzureApiVersion.trim();
      if (!providerEndpoint || !providerApiKey) {
        return null;
      }

      if (this.llmUseAzure && !azureApiVersion) {
        return null;
      }

      const params: DirectProviderRequestPipelineParams = {
        normalizedInput,
        provider: {
          providerType: this.directProviderType,
          endpoint: providerEndpoint,
          apiKey: providerApiKey,
          model,
          useAzure: this.llmUseAzure,
          azureApiVersion: azureApiVersion || undefined,
          extraHeaders: runtimeProviderConfig?.extraHeaders
        }
      };

      return buildDirectProviderRequestPipeline(params);
    },

    /**
     * Returns the validated Direct Provider result after one bounded repair
     * pass, if provider output has been supplied.
     */
    directProviderStructuredExtractionResult(): StructuredExtractionRepairResult | null {
      if (!this.directProviderStructuredGenerationOutput) {
        return null;
      }

      const generatedOutput = this.directProviderStructuredGenerationOutput;

      const repairInput = {
        outputJson: generatedOutput.outputJson,
        outputText: generatedOutput.outputText,
        providerId: generatedOutput.providerId,
        model: generatedOutput.model
      };

      const repair = validateAndRepairStructuredExtractionOutput as (input: unknown) => StructuredExtractionRepairResult;
      return repair(repairInput as unknown);
    },

    /**
     * Returns the compact failure display state for client-side validation
     * issues.
     */
    directProviderStructuredExtractionFailureDisplayState(): StructuredExtractionFailureDisplayState | null {
      return buildStructuredExtractionFailureDisplayState(this.directProviderStructuredExtractionResult?.validation ?? null);
    },

    /**
     * Returns the validated structured extraction payload when available.
     * The generated editor file is built later from this validated payload.
     */
    directProviderValidatedStructuredExtractionOutput() {
      const validation = this.directProviderStructuredExtractionResult;
      return validation?.validation.result ?? null;
    },

    /**
     * Returns whether the report URL is valid enough for submission.
     * @returns
     *  True if the URL has a basic HTTP(S) shape.
     */
    isSourceUrlValid(): boolean {
      try {
        const url = new URL(this.sourceUrl.trim());
        const protocolAllowed = this.apiHealthCheckSucceeded
          ? url.protocol === "http:" || url.protocol === "https:"
          : url.protocol === "https:";
        return protocolAllowed && !!url.hostname && !url.username && !url.password;
      } catch {
        return false;
      }
    },

    /**
     * Returns whether the selected source type has source data.
     * @returns
     *  True if source data has been provided.
     */
    hasSourceData(): boolean {
      switch(this.sourceType) {
        case "upload":
          return this.normalizedInputPackage !== null;
        case "url":
          return this.isSourceUrlValid;
        case "text":
          return this.normalizedInputPackage !== null;
        default:
          return false;
      }
    },

    // eslint-disable-next-line vue/return-in-computed-property
    sourceData(): string | File {
        if (!this.sourceType) {
            throw new Error("Cannot get source without source type.")
        }

        switch(this.sourceType) {
            case "url":
                return this.sourceUrl;
            case "text":
                return this.sourceText;
            case "upload":
                if (!this.sourceFile) {
                    throw new Error("Cannot get source file data.")
                }
                return this.sourceFile;
        }
    },

    /**
     * Returns whether the AI generation form can be submitted.
     * @returns
     *  True if the required generation inputs are populated.
     */
    canGenerate(): boolean {
        // If using AFB API, only the source data input is required.
        // However, if LLM info is given, it must be complete.
        if (this.apiHealthCheckSucceeded) {
            const isAzureOverride = this.llmType === "azure_openai";
            const providerSelection = isAzureOverride
                ? this.llmAzureDeployment.trim() && this.llmAzureApiVersion.trim()
                : this.llmModel.trim();
            const llmInfoFullyFull = this.llmType
                && this.llmEndpoint.trim()
                && this.llmToken.trim()
                && providerSelection;
            const llmInfoFullyEmpty = !(
                this.llmType
                || this.llmEndpoint.trim()
                || this.llmToken.trim()
                || (isAzureOverride
                    ? this.llmAzureDeployment.trim() || this.llmAzureApiVersion.trim()
                    : this.llmModel.trim())
            );
            return !!(
                this.hasSourceData
                && (llmInfoFullyFull || llmInfoFullyEmpty)
                && this.generationStatus !== 'loading'
            );
        }


        // If using the direct-provider path, the direct-provider fields must be filled out.
      return !!(
          this.hasSourceData
          && this.llmEndpoint.trim()
          && this.llmToken.trim()
          && (!this.llmUseAzure || this.llmAzureApiVersion.trim())
          && (this.llmModel.trim())
        );
    },

    supportsAzureSettings(): boolean {
      return this.activeProviderType === "openai_compatible";
    },

    activeProviderType(): SupportedRuntimeProviderType {
      if (this.llmType === "gemini") {
        return "gemini";
      }

      if (this.llmType === "openai_compatible") {
        return "openai_compatible";
      }

      if (this.llmType === "anthropic") {
        return "anthropic";
      }

      return this.runtimeProviderStore.runtimeProviderConfig?.providerType || "openai_compatible";
    },

    directProviderType(): SupportedRuntimeProviderType {
      return this.activeProviderType;
    },

    iconColor(){
        let result = "#737373";
        const theme_id = this.applicationStore.activeEditor.file.factory.theme.id;
        switch (theme_id) {
            case "dark_theme":
                result = "#89a0ec";
                break;
            case "light_theme":
            case "blog_theme":
                result = "#2E5FAD";
                break;
        }
        return result;
    }

  },
  watch: {
    llmType: {
      handler() {
        if (!this.supportsAzureSettings) {
          this.llmUseAzure = false;
          this.llmAzureApiVersion = "";
        }
        if (this.llmType !== "azure_openai") {
          this.llmAzureDeployment = "";
        }
      },
      immediate: true
    }
  },
  async mounted() {
    this.apiHealthCheckInProgress = true;
    try {
        const res = await fetchHealthCheck();

        if (res.status === "ok") {
            this.apiHealthCheckSucceeded = true;
        }
    } catch (e) {
        console.error(e);
    }
    this.apiHealthCheckInProgress = false;

    if (this.apiHealthCheckSucceeded) {
        console.log("API health check succeeded. Using AFB API.");
    } else {
        console.log("API health check failed. Using LLM API.")
        const runtimeProviderConfig = this.runtimeProviderStore.runtimeProviderConfig;

        if (runtimeProviderConfig) {
            // Load values from local storage.
            this.llmModel = runtimeProviderConfig.model?.trim() ?? "";
            this.llmEndpoint = runtimeProviderConfig.endpoint?.trim() ?? "";
            this.llmType = runtimeProviderConfig.providerType;
            this.llmUseAzure = !!runtimeProviderConfig.useAzure;
            this.llmAzureApiVersion = runtimeProviderConfig.azureApiVersion?.trim() ?? "";
        }
    }
  },
  methods: {

    /**
     * Selects the AI generation source type.
     * @param sourceType
     *  The selected source type.
     */
    selectSourceType(sourceType: Exclude<SourceType, null>) {

      if (this.generationStatus === 'loading') {
        return;
      }

      if(this.sourceType !== sourceType) {
        this.clearSourceData();
      }
      this.sourceType = sourceType;
    },

    /**
     * Opens the report PDF file selection dialog.
     */
    openSourceFileDialog() {
      (this.$refs.sourceFileInput as HTMLInputElement | undefined)?.click();
    },

    /**
     * Updates the selected report PDF.
     *
     * Text-based PDFs are extracted client-side; PDFs without extractable text
     * are surfaced as a clear local failure.
     * @param event
     *  The file input change event.
     */
    async onSourceFileSelected(event: Event) {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0] ?? null;
      if(file && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))) {
        const requestId = ++this.pdfExtractionRequestId;
        this.sourceFile = file;
        this.sourceFileName = file.name;
        this.sourceText = "";
        this.pdfExtractionResult = null;
        this.pdfExtractionError = null;
        this.pdfExtractionState = {
          status: "selected",
          sourceType: "pdf",
          filename: file.name
        };
        try {
          const result = await new BrowserPdfExtractionService().extract(file);
          if (requestId !== this.pdfExtractionRequestId) {
            return;
          }
          this.pdfExtractionResult = result;
          this.pdfExtractionState = {
            status: "success",
            result
          };
          this.sourceText = result.extractedText;
        } catch (error) {
          if (requestId !== this.pdfExtractionRequestId) {
            return;
          }
          const normalized = error instanceof PdfExtractionServiceError
            ? error.error
            : normalizePdfExtractionFailure(error, {
              filename: file.name,
              fallbackCode: "parse_failure",
              fallbackMessage: "The PDF could not be parsed.",
              fallbackDetails: {
                cause: error instanceof Error ? error.name || "Error" : "unknown"
              }
            });
          this.pdfExtractionResult = null;
          this.pdfExtractionError = normalized;
          this.pdfExtractionState = {
            status: "error",
            error: normalized
          };
          this.sourceText = "";
        }
      } else {
        this.pdfExtractionRequestId += 1;
        this.sourceFile = null;
        this.sourceFileName = "";
        this.pdfExtractionResult = null;
        this.pdfExtractionError = null;
        this.pdfExtractionState = { status: "idle" };
        this.sourceText = "";
      }
      input.value = "";
    },

    /**
     * Clears the current source data.
     */
    clearSourceData() {
      this.pdfExtractionRequestId += 1;
      this.sourceFile = null;
      this.sourceFileName = "";
      this.pdfExtractionResult = null;
      this.pdfExtractionError = null;
      this.directProviderStructuredGenerationOutput = null;
      this.generationStatus = "idle";
      this.generationMessage = "";
      this.pdfExtractionState = { status: "idle" };
      this.sourceUrl = "";
      this.sourceText = "";
    },

    async buildNormalizedInputPackage(): Promise<NormalizedInputPackage | null> {
      if (this.sourceType === "text") {
        const text = this.sourceText.trim();
        return text ? normalizeRawTextInput(this.sourceText, { sourceName: "Pasted Text" }) : null;
      }

      if (this.sourceType === "url") {
        const url = this.sourceUrl.trim();
        return url ? prepareDirectProviderUrlInput(url, { sourceName: "Link to Report" }) : null;
      }

      if (this.sourceType === "upload" && this.sourceFile) {
        const extracted = await new BrowserPdfExtractionService().extract(this.sourceFile);
        return normalizePdfExtractionInput(extracted, { sourceName: "PDF Upload" });
      }

      return null;
    },


    /**
     * Click handler for the "generate" button.
     */
    async onClickGenerate() {

        if (!this.sourceType) {
            const msg = `sourceType should exist.`;
            this.generationStatus = 'error';
            this.generationMessage = msg;
            throw new Error(msg);
        }

        this.generationStatus = 'loading';
        this.generationMessage = 'Flow generation queued...';

        let requestOptions = {};

        if (this.llmType && this.llmEndpoint && this.llmToken) {
            const isAzureOverride = this.llmType === "azure_openai";
            const providerModel = isAzureOverride
                ? this.llmAzureDeployment.trim()
                : this.llmModel.trim();
            requestOptions = {
                options: {
                    provider_override: {
                        provider_type: this.llmType,
                        endpoint: this.llmEndpoint.trim(),
                        api_key: this.llmToken.trim(),
                        model: providerModel,
                        ...(isAzureOverride ? {
                            deployment: this.llmAzureDeployment.trim(),
                            api_version: this.llmAzureApiVersion.trim()
                        } : {})
                    }
                }
            }
        }

        try {
            if (this.apiHealthCheckSucceeded) {
                const result = await runJobToResult(this.sourceType, this.sourceData, requestOptions)
                console.debug("Job result: ", result);
                if (result.status === "completed") {
                    const afbContents = await fetchJobResultArtifact(result.job_id, "afb");
                    await this.applicationStore.execute(await prepareEditorFromExistingFile(this.applicationStore, afbContents));
                    this.generationStatus = 'success';
                    this.generationMessage = "Generated flow opened in the editor.";
                } else {
                    throw new Error(`Flow result failed: ${result.error_message}`);
                }
            } else {
                const runtimeProviderConfig = this.runtimeProviderStore.runtimeProviderConfig;
                const model = this.llmModel.trim() || runtimeProviderConfig?.model.trim();
                if (!model) {
                    throw new Error("Direct provider mode requires a configured model.");
                }

                const normalizedInput = await this.buildNormalizedInputPackage();
                if (!normalizedInput) {
                    throw new Error("Direct provider mode requires source input.");
                }

                const directProviderRequestParams: DirectProviderRequestPipelineParams = {
                    normalizedInput,
                    provider: {
                        providerType: this.directProviderType,
                        endpoint: this.llmEndpoint.trim(),
                        apiKey: this.llmToken.trim(),
                        model,
                        useAzure: this.llmUseAzure,
                        azureApiVersion: this.llmAzureApiVersion.trim() || undefined,
                        extraHeaders: runtimeProviderConfig?.extraHeaders
                    }
                };

                const request = buildDirectProviderRequestPipeline(directProviderRequestParams);
                const adapter = new AiSdkProviderAdapter({
                    providerType: this.directProviderType,
                    endpoint: this.llmEndpoint.trim(),
                    apiKey: this.llmToken.trim(),
                    model,
                    useAzure: this.llmUseAzure,
                    azureApiVersion: this.llmAzureApiVersion.trim() || undefined,
                    extraHeaders: runtimeProviderConfig?.extraHeaders
                });
                const output = await adapter.generateStructured(request);
                const repair = validateAndRepairStructuredExtractionOutput as (input: unknown) => StructuredExtractionRepairResult;
                const repaired = repair({
                outputJson: output.outputJson,
                outputText: output.outputText,
                providerId: output.providerId,
                model: output.model
                } as unknown);
                const extraction = repaired.validation.result;
                if (!extraction) {
                    throw new Error(repaired.validation.failures[0]?.message || "Validated structured extraction output is not available.");
                }

                const command = await prepareEditorFromValidatedStructuredExtraction(this.applicationStore, extraction);
                await this.applicationStore.execute(command);
                this.generationStatus = 'success';
                this.generationMessage = "Generated flow opened in the editor.";

                // On success, save direct-provider inputs to local storage.
                this.runtimeProviderStore.setRuntimeProviderConfig({
                    providerType: this.directProviderType,
                    endpoint: this.llmEndpoint.trim(),
                    apiKey: "",
                    model
                })
            }
        } catch (error: unknown) {
            this.generationStatus = 'error';
            if (error instanceof Error) {
                console.error(error.stack ? error.stack : error.message);
                this.generationMessage = error.message;
            } else {
                console.error(error);
                this.generationMessage = "An unknown error occurred."
            }
        }
    },
    /**
     * Stores the latest provider output for later validation/repair.
     */
    setDirectProviderStructuredGenerationOutput(output: DirectProviderStructuredGenerationOutputLite | null) {
      this.directProviderStructuredGenerationOutput = output;
      this.generationMessage = "";
      this.generationStatus = "idle";
    },

    onClickBack() {
        this.$emit('onClickBack');
    }

  },
  components: {
    EmptyPageIcon,
    FolderIcon,
    LinkIcon,
    LoadingSpinner,
    AIGenerationProviderType,
    ArrowLeftIcon
  }
});
</script>

<style scoped>
.ai-generation {
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
}

.health-check-loading-indicator {
    position: absolute;
    top: 0;
    left: 0;
    text-align: center;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    color: var(--af-text-color-primary);
}

.generation-title {
  color: var(--af-text-color-primary);
  font-size: 13.5pt;
  font-weight: 700;
  margin-bottom: 12px;
  margin-top: -10px;
}

.ai-generation .section {
  margin-bottom: 20px;
}

.ai-generation .results-section {
    text-align: center;
    color: var(--af-text-color-secondary);
}

.source-type-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.button {
  border: solid 1px var(--af-border-color-primary);
  border-radius: 5px;
  box-sizing: border-box;
  padding: 24px;
  user-select: none;
}

.button:hover,
.source-type-button.selected {
  background: var(--af-border-color-primary);
}

.source-type-button.selected {
  border-color: var(--af-color-info);
}

.source-type-button:focus-visible {
  outline: solid 2px var(--af-color-info);
  outline-offset: 2px;
}

.button-header {
  align-items: center;
  display: flex;
  height: 17px;
  margin-bottom: 6px;
}

.button-icon {
  align-items: center;
  display: flex;
  height: 15px;
  justify-content: center;
  margin-right: 10px;
  width: 17px;
}

.button-icon svg {
  fill: var(--af-color-info);
}

.button-title {
  color: var(--af-color-info);
  font-size: 12.5pt;
  font-weight: 700;
  white-space: nowrap;
}

.button-description {
  color: var(--af-text-color-secondary);
  font-size: 10pt;
}

.section-title {
  color: var(--af-text-color-secondary);
  font-size: 9.5pt;
  font-weight: 500;
  margin-left: 2px;
  margin-bottom: 10px;
}

.form-field {
  color: var(--af-text-color-secondary);
  display: flex;
  flex-direction: column;
  font-size: 9.5pt;
  font-weight: 500;
  gap: 6px;
}

.form-field input,
.form-field textarea {
  background: var(--af-bg-color-primary);
  border: solid 1px var(--af-border-color-primary);
  border-radius: 5px;
  box-sizing: border-box;
  color: var(--af-text-color-primary);
  font-size: 10pt;
  height: 28px;
  padding: 4px 8px;
}

.form-field input:disabled,
.form-field textarea:disabled {
  color: var(--af-text-color-secondary);
}

.form-field textarea {
  height: 62px;
  line-height: 16px;
  overflow-y: auto;
  resize: none;
}

.form-field select {
    background: var(--af-bg-color-primary);
    border: 1px solid var(--af-border-color-primary);
    border-radius: 5px;
    color: var(--af-text-color-primary);
    padding: 5px;
    color: var(--af-text-color-primary);
}

.form-field input::placeholder,
.form-field textarea::placeholder,
.form-field select.empty {
    color: var(--af-text-color-placeholder)
}

.field-hint {
  color: var(--af-text-color-secondary);
  font-size: 8.5pt;
  font-weight: 400;
}

.azure-toggle-field {
  grid-column: 1 / -1;
  gap: 6px;
}

.switch-row {
  align-items: center;
  color: var(--af-text-color-primary);
  display: flex;
  justify-content: flex-start;
  font-size: 10pt;
  font-weight: 400;
  gap: 12px;
  min-height: 28px;
}

.switch-label {
  flex: 0 0 auto;
}

.switch-control {
  display: inline-flex;
  flex: 0 0 auto;
  position: relative;
  width: 40px;
  height: 22px;
}

.switch-input {
  appearance: none;
  cursor: pointer;
  height: 100%;
  left: 0;
  margin: 0;
  opacity: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 1;
}

.switch-track {
  background: var(--af-border-color-primary);
  border: solid 1px var(--af-border-color-primary);
  border-radius: 999px;
  box-sizing: border-box;
  height: 100%;
  position: relative;
  transition: background 0.15s ease, border-color 0.15s ease;
  width: 100%;
}

.switch-track::after {
  background: var(--af-text-color-primary);
  border-radius: 50%;
  content: "";
  height: 16px;
  left: 2px;
  position: absolute;
  top: 2px;
  transition: transform 0.15s ease, background 0.15s ease;
  width: 16px;
}

.switch-input:checked + .switch-track {
  background: var(--af-color-info);
  border-color: var(--af-color-info);
}

.switch-input:checked + .switch-track::after {
  background: #111;
  transform: translateX(18px);
}

.switch-input:focus-visible + .switch-track {
  outline: solid 2px var(--af-color-info);
  outline-offset: 2px;
}

.source-upload-control {
  display: flex;
  gap: 8px;
}

.source-upload-control input {
  flex: 1;
}

.source-upload-button {
  background: var(--af-bg-color-primary);
  border: solid 1px var(--af-border-color-primary);
  border-radius: 5px;
  color: var(--af-color-info);
  font-size: 9.5pt;
  font-weight: 700;
  padding: 4px 12px;
  white-space: nowrap;
}

.source-upload-button:hover {
  background: var(--af-border-color-primary);
}

.source-upload-error {
  color: var(--af-color-error);
  font-size: 10pt;
  margin-top: 8px;
}

.file-input {
  display: none;
}

.source-data-field {
  margin-top: 16px;
  margin-bottom: 4px;
}

.source-data-field .section-title {
  margin-bottom: 0px;
}

.llm-information {
  margin-top: 10px;
  margin-bottom: 0;
}

.llm-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.llm-container {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
}

.llm-override-details {
  margin-top: 12px;
}

.compact-results-section {
  margin-top: 10px;
}

.generate-button {
  background: var(--af-color-info);
  border: none;
  border-radius: 5px;
  color: #111;
  display: block;
  font-size: 9.5pt;
  font-weight: 700;
  height: 34px;
  margin: 14px auto 0;
  min-width: 210px;
}

[data-theme="light_theme"] .generate-button, [data-theme="blog_theme"] .generate-button {
    color: #eee;
}

.generate-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

details summary {
    cursor: pointer;
}

/* 1. Hide the default arrow */
summary {
  list-style: none;
  display: flex;
  gap: 10px;
  align-items: center;
  cursor: pointer;
}
summary::-webkit-details-marker {
  display: none; /* Safari/Chromium fix */
}

/* 2. Add custom arrow on the right side */
summary::after {
  content: "❯";
  font-size: 0.8rem;
  transition: transform 0.2s ease;
}

/* 3. Rotate arrow when open */
details[open] summary::after {
  transform: rotate(90deg);
}
.generation-message {
  color: var(--af-text-color-secondary);
  font-size: 11pt;
  line-height: 1.4;
  margin-top: 12px;
  min-height: 1.4em;
  text-align: center;
}

.generation-message[data-status="error"] {
  color: var(--af-color-error);
}

.back-button {
    border: none;
    background: none;
    color: var(--af-color-info);
    display: flex;
    align-items: center;
    gap: 5px;
    margin-left: -5px;
}
</style>
