/**
 * Internet Control Panel — Command Registry
 * Sets globalThis.ICPCommands.
 */

'use strict';

globalThis.ICPCommands = (() => {
  /** @type {Map<string, { handler: Function, metadata: object }>} */
  const registry = new Map();
  /** @type {Map<string, string>} alias → canonical name */
  const aliasMap = new Map();

  /**
   * Register a command.
   * @param {string} name - canonical command name
   * @param {Function} handler - async (context) => { ok, message, data? }
   * @param {object} [metadata] - { aliases?, description? }
   */
  function register(name, handler, metadata = {}) {
    if (!name || typeof handler !== 'function') return;
    registry.set(name, { handler, metadata });
    aliasMap.set(name, name); // canonical name maps to itself
    const aliases = Array.isArray(metadata.aliases) ? metadata.aliases : [];
    aliases.forEach((alias) => {
      if (alias) aliasMap.set(alias, name);
    });
  }

  /**
   * Resolve a name or alias to a canonical command name.
   * @param {string} nameOrAlias
   * @returns {string|null}
   */
  function resolve(nameOrAlias) {
    return aliasMap.get((nameOrAlias || '').trim().toLowerCase()) || null;
  }

  /**
   * Run a command by name or alias.
   * @param {string} nameOrAlias
   * @param {object} [context]
   * @returns {Promise<{ ok: boolean, message: string, data?: any }>}
   */
  async function run(nameOrAlias, context = {}) {
    const canonical = resolve(nameOrAlias);
    if (!canonical) {
      return {
        ok: false,
        message: `Unknown command: "${nameOrAlias}". Type "help" for a list.`,
      };
    }
    const entry = registry.get(canonical);
    if (!entry) {
      return { ok: false, message: `Command "${canonical}" not found in registry.` };
    }
    try {
      const result = await entry.handler(context);
      return result && typeof result === 'object' ? result : { ok: true, message: String(result || '') };
    } catch (e) {
      return { ok: false, message: `Command "${canonical}" threw: ${String(e)}` };
    }
  }

  /**
   * List all registered commands with their metadata.
   * @returns {Array<{ name: string, aliases: string[], description: string }>}
   */
  function list() {
    const result = [];
    registry.forEach((entry, name) => {
      result.push({
        name,
        aliases: Array.isArray(entry.metadata.aliases) ? entry.metadata.aliases : [],
        description: entry.metadata.description || '',
      });
    });
    return result;
  }

  return Object.freeze({ register, run, list, resolve });
})();
