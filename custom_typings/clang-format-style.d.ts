type ClangFormatStyleBase = 'LLVM'|'Google'|'Chromium'|'Mozilla'|'WebKit';
type BracketAlignmentStyle = 'Align'|'DontAlign'|'AlwaysBreak';
type EscapedNewlineAlignmentStyle = 'DontAlign'|'Left'|'Right';
type ShortFunctionStyle = 'None'|'InlineOnly'|'Empty'|'Inline'|'All';
type DefinitionReturnTypeBreakingStyle = 'None'|'All'|'TopLevel';
type ReturnTypeBreakingStyle =
    'None'|'All'|'TopLevel'|'AllDefinitions'|'TopLevelDefinitions';
interface BraceWrappingFlags {
  AfterClass?: boolean;
  AfterControlStatement?: boolean;
  AfterEnum?: boolean;
  AfterFunction?: boolean;
  AfterNamespace?: boolean;
  AfterObjCDeclaration?: boolean;
  AfterStruct?: boolean;
  AfterUnion?: boolean;
  AfterExternBlock?: boolean;
  BeforeCatch?: boolean;
  BeforeElse?: boolean;
  IndentBraces?: boolean;
  SplitEmptyFunction?: boolean;
  SplitEmptyRecord?: boolean;
  SplitEmptyNamespace?: boolean
}
type BinaryOperatorStyle = 'None'|'NonAssignment'|'All';
type BraceBreakingStyle =
    'Attach'|'Linux'|'Mozilla'|'Stroustrup'|'Allman'|'GNU'|'WebKit'|'Custom';
type BreakConstructorInitializersStyle =
    'BeforeColon'|'BeforeComma'|'AfterColon';
type IncludeBlocksStyle = 'Preserve'|'Merge'|'Regroup';
interface IncludeCategory {
  Regex: string;
  Priority: number
}
type PPDirectiveIndentStyle = 'None'|'AfterHash';
type JavaScriptQuoteStyle = 'Leave'|'Single'|'Double';
type LanguageKind =
    'None'|'Cpp'|'Java'|'JavaScript'|'ObjC'|'Proto'|'TableGen'|'Proto';
type NamespaceIndentationKind = 'None'|'Inner'|'All';
type BinPackStyle = 'Auto'|'Always'|'Never';
type PointerAlignmentStyle = 'Left'|'Right'|'Middle';
type SpaceBeforeParensOptions = 'Never'|'ControlStatements'|'Always';
type LanguageStandard = 'Cpp01'|'Cpp11'|'Auto';
type UseTabStyle =
    'Never'|'ForIndentation'|'ForContinuationAndIndentation'|'Always';

export interface ClangFormatStyle {
  BasedOnStyle?: ClangFormatStyleBase;
  AccessModifierOffset?: number;
  AlignAfterOpenBracket?: BracketAlignmentStyle;
  AlignConsecutiveAssignments?: boolean;
  AlignConsecutiveDeclarations?: boolean;
  AlignEscapedNewlines?: EscapedNewlineAlignmentStyle;
  AlignOperands?: boolean;
  AlignTrailingComments?: boolean;
  AllowAllParametersOfDeclarationOnNextLine?: boolean;
  AllowShortBlocksOnASingleLine?: boolean;
  AllowShortCaseLabelsOnASingleLine?: boolean;
  AllowShortFunctionsOnASingleLine?: ShortFunctionStyle;
  AllowShortLoopsOnASingleLine?: boolean;
  AlwaysBreakAfterDefinitionReturnType?: DefinitionReturnTypeBreakingStyle;
  AlwaysBreakAfterReturnType?: ReturnTypeBreakingStyle;
  AlwaysBreakBeforeMultilineStrings?: boolean;
  AlwaysBreakTemplateDeclarations?: boolean;
  BinPackArguments?: boolean;
  BinPackParameters?: boolean;
  BraceWrapping?: BraceWrappingFlags;
  BreakAfterJavaFieldAnnotations?: boolean;
  BreakBeforeBinaryOperators?: BinaryOperatorStyle;
  BreakBeforeBraces?: BraceBreakingStyle;
  BreakBeforeInheritanceComma?: boolean;
  BreakBeforeTernaryOperators?: boolean;
  BreakConstructorInitializers?: BreakConstructorInitializersStyle;
  BreakStringLiterals?: boolean;
  CommentPragmas?: string;
  CompactNamespaces?: boolean;
  ConstructorInitializerAllOnOneLineOrOnePerLine?: boolean;
  ConstructorInitializerIndentWidth?: number;
  ContinuationIndentWidth?: number;
  Cpp11BracedListStyle?: boolean;
  DerivePointerAlignment?: boolean;
  DisableFormat?: boolean;
  ExperimentalAutoDetectBinPacking?: boolean;
  FixNamespaceComments?: boolean;
  ForEachMacros?: string[];
  IncludeBlocks?: IncludeBlocksStyle;
  IncludeCategories?: IncludeCategory[];
  IncludeIsMainRegex?: string;
  IndentCaseLabels?: boolean;
  IndentPPDirectives?: PPDirectiveIndentStyle;
  IndentWidth?: number;
  IndentWrappedFunctionNames?: boolean;
  JavaScriptQuotes?: JavaScriptQuoteStyle;
  JavaScriptWrapImports?: boolean;
  KeepEmptyLinesAtTheStartOfBlocks?: boolean;
  Language?: LanguageKind;
  MacroBlockBegin?: string;
  MacroBlockEnd?: string;
  MaxEmptyLinesToKeep?: number;
  NamespaceIndentation?: NamespaceIndentationKind;
  ObjCBinPackProtocolList?: BinPackStyle;
  ObjCBlockIndentWidth?: number;
  ObjCSpaceAfterProperty?: boolean;
  ObjCSpaceBeforeProtocolList?: boolean;
  PenaltyBreakAssignment?: number;
  PenaltyBreakBeforeFirstCallParameter?: number;
  PenaltyBreakComment?: number;
  PenaltyBreakFirstLessLess?: number;
  PenaltyBreakString?: number;
  PenaltyExcessCharacter?: number;
  PenaltyReturnTypeOnItsOwnLine?: number;
  PointerAlignment?: PointerAlignmentStyle;
  RawStringFormats?: any[];  // no idea on how to do this typing
  ReflowComments?: boolean;
  SortIncludes?: boolean;
  SortUsingDeclarations?: boolean;
  SpaceAfterCStyleCast?: boolean;
  SpaceAfterTemplateKeyword?: boolean;
  SpaceBeforeAssignmentOperators?: boolean;
  SpaceBeforeCtorInitializerColon?: boolean;
  SpaceBeforeInheritanceColon?: boolean;
  SpaceBeforeParens?: SpaceBeforeParensOptions;
  SpaceBeforeRangeBasedForLoopColon?: boolean;
  SpaceInEmptyParentheses?: boolean;
  SpacesBeforeTrailingComments?: number;
  SpacesInAngles?: boolean;
  SpacesInCStyleCastParentheses?: boolean;
  SpacesInContainerLiterals?: boolean;
  SpacesInParentheses?: boolean;
  SpacesInSquareBrackets?: boolean;
  Standard?: LanguageStandard;
  TabWidth?: number;
  UseTab?: UseTabStyle
}