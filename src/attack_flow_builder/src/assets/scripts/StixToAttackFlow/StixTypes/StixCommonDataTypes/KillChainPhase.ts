export interface KillChainPhase {

    /**
     * The name of the kill chain. The value of this property SHOULD be all
     * lowercase and SHOULD use hyphens instead of spaces or underscores as word
     * separators.
     */
    kill_chain_name: string;

    /**
     * The name of the phase in the kill chain. The value of this property
     * SHOULD be all lowercase and SHOULD use hyphens instead of spaces or
     * underscores as word separators.
     */
    phase_name: string;

}
