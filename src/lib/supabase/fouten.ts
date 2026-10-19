/**
 * Gooit een fout met de Supabase-foutmelding als die er is.
 *
 * Na elke Supabase-aanroep wordt gecontroleerd of er een fout is; deze
 * helper voorkomt dat die controle overal apart wordt uitgeschreven.
 */
export function gooiAlsFout(
  error: { message: string } | null,
): asserts error is null {
  if (error) throw new Error(error.message)
}
