import * as vscode from 'vscode';
import {
  LanguagePreference,
  resolveLocale,
  SupportedLocale,
  translate,
  TranslationKey
} from '../localizationCatalog';

export class LocalizationManager {
  private static locale: SupportedLocale = 'en';
  private static listener: vscode.Disposable | undefined;

  public static initialize(context: vscode.ExtensionContext, onChanged: () => void): void {
    this.refreshLocale();
    this.listener = vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration('conn2flow.language')) {
        this.refreshLocale();
        onChanged();
      }
    });
    context.subscriptions.push(this.listener);
  }

  public static get currentLocale(): SupportedLocale {
    return this.locale;
  }

  public static get languageLabel(): string {
    return this.t(this.locale === 'pt-BR' ? 'language.pt-BR' : 'language.en');
  }

  public static t(
    key: TranslationKey,
    values: Readonly<Record<string, string | number | boolean>> = {}
  ): string {
    return translate(this.locale, key, values);
  }

  public static async selectLanguage(): Promise<void> {
    const options: Array<{ label: string; value: LanguagePreference }> = [
      { label: this.t('language.auto'), value: 'auto' },
      { label: this.t('language.pt-BR'), value: 'pt-BR' },
      { label: this.t('language.en'), value: 'en' }
    ];
    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: this.t('settings.language')
    });
    if (!selected) return;

    await vscode.workspace
      .getConfiguration('conn2flow')
      .update('language', selected.value, vscode.ConfigurationTarget.Global);
    this.refreshLocale();
    vscode.window.showInformationMessage(
      `${this.t('language.changed', { language: selected.label })} ${this.t('language.reload')}`
    );
  }

  private static refreshLocale(): void {
    const preference = vscode.workspace
      .getConfiguration('conn2flow')
      .get<LanguagePreference>('language', 'auto');
    this.locale = resolveLocale(preference, vscode.env.language, process.env.CONN2FLOW_LANGUAGE);
  }
}
