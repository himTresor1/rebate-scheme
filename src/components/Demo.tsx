import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Info, 
  Download,
  Upload,
  Settings,
  User,
  FileText,
  BarChart3,
  Home,
  Copy,
  Check,
  ArrowLeft,
  ImageIcon,
  Trash2,
  Eye,
  Edit,
  Plus
} from 'lucide-react';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  DemoInputStates,
  DemoTextareaStates,
  DemoFileUploads,
  DemoDownloadButtons,
  DemoModals
} from './DemoExtended';

export function Demo() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [switchState, setSwitchState] = useState(false);
  const [checkboxState, setCheckboxState] = useState(false);
  const [sliderValue, setSliderValue] = useState([50]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(label);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const colors = [
    { name: 'Primary', hex: '#023F40', description: 'Main brand color, used for primary actions and key UI elements' },
    { name: 'Secondary', hex: '#6DB27F', description: 'Secondary accent, used for highlights and secondary actions' },
    { name: 'Background', hex: '#FFFFFF', description: 'Main background color' },
    { name: 'Foreground', hex: '#1A1A1A', description: 'Primary text color' },
    { name: 'Muted', hex: '#ECECF0', description: 'Muted backgrounds and subtle UI elements' },
    { name: 'Muted Foreground', hex: '#717182', description: 'Secondary text color' },
    { name: 'Accent', hex: '#E9EBEF', description: 'Accent background for hover states' },
    { name: 'Destructive', hex: '#D4183D', description: 'Error and destructive actions' },
    { name: 'Border', hex: 'rgba(0, 0, 0, 0.1)', description: 'Border color for inputs and dividers' },
    { name: 'Input Background', hex: '#F3F3F5', description: 'Input field background' },
    { name: 'Sidebar', hex: '#023F40', description: 'Sidebar background' },
    { name: 'Sidebar Primary', hex: '#014F50', description: 'Sidebar primary elements' },
    { name: 'Sidebar Accent', hex: '#035F60', description: 'Sidebar accent elements' },
  ];

  const typography = [
    { tag: 'h1', size: '56px', weight: 'Bold (700)', lineHeight: '72px', use: 'Page Titles', example: 'H1 headline' },
    { tag: 'h2', size: '40px', weight: 'Bold (700)', lineHeight: '56px', use: 'Section Headers', example: 'H2 headline' },
    { tag: 'h3', size: '28px', weight: 'Medium (500)', lineHeight: '40px', use: 'Card Titles', example: 'H3 headline' },
    { tag: 'h4', size: '26px', weight: 'Regular (400)', lineHeight: '32px', use: 'Modal Titles', example: 'H4 headline' },
    { tag: 'h5', size: '22px', weight: 'Regular (400)', lineHeight: '32px', use: 'Subsections', example: 'H5 headline' },
    { tag: 'h6', size: '20px', weight: 'Regular (400)', lineHeight: '28px', use: 'Table Headers', example: 'H6 headline' },
    { tag: 'body-large', size: '18px', weight: 'Medium (500)', lineHeight: '27px', use: 'Content Details', example: 'Body Large' },
    { tag: 'body-medium', size: '14px', weight: 'Medium (500)', lineHeight: '20px', use: 'Body Text', example: 'Body Medium' },
    { tag: 'body-small', size: '12px', weight: 'Regular (400)', lineHeight: '18px', use: 'Captions', example: 'Body Small' },
    { tag: 'button', size: '14px', weight: 'Semibold (600)', lineHeight: '21px', use: 'Button Text', example: 'Button' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#023F40] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2">MFA Rebate Scheme System</h1>
              <p className="text-white/80">Design System Documentation</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Overview Section */}
        <section>
          <Card className="p-6 bg-white">
            <h2 className="mb-4">System Overview</h2>
            <p className="text-muted-foreground mb-4">
              This comprehensive design system powers the MFA Rebate Scheme System, ensuring consistency 
              across all user interfaces. The system adheres to strict brand guidelines with the primary 
              color #023F40 and uses Poppins as the primary typeface.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="mb-2">Primary Font</h4>
                <p className="text-sm text-muted-foreground">Poppins (400, 500, 600, 700)</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="mb-2">Base Font Size</h4>
                <p className="text-sm text-muted-foreground">16px (1rem)</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="mb-2">Border Radius</h4>
                <p className="text-sm text-muted-foreground">0.625rem (10px)</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Color Palette */}
        <section>
          <div className="mb-6">
            <h2 className="mb-2">Color Palette</h2>
            <p className="text-muted-foreground">
              Complete color system with semantic naming and usage guidelines
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colors.map((color) => (
              <Card key={color.name} className="overflow-hidden">
                <div 
                  className="h-32 flex items-center justify-center relative"
                  style={{ 
                    backgroundColor: color.hex,
                    color: ['#023F40', '#014F50', '#035F60'].includes(color.hex) ? '#fff' : '#000'
                  }}
                >
                  <span className="font-semibold">{color.name}</span>
                  <button
                    onClick={() => copyToClipboard(color.hex, color.name)}
                    className="absolute top-2 right-2 p-2 rounded bg-white/20 hover:bg-white/30 transition-colors"
                    title="Copy color code"
                  >
                    {copiedColor === color.name ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">{color.hex}</code>
                  </div>
                  <p className="text-xs text-muted-foreground">{color.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <div className="mb-6">
            <h2 className="mb-2">Typography</h2>
            <p className="text-muted-foreground">
              Hierarchical text system using Poppins with consistent sizing and weights
            </p>
          </div>

          <Card className="p-6 bg-white">
            <div className="space-y-8">
              
              {/* Typeface Display */}
              <div>
                <h3 className="mb-4 text-muted-foreground uppercase tracking-wider text-xs">Typeface</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-muted/30 rounded-lg">
                    <div className="text-6xl mb-2" style={{ fontWeight: 400 }}>Aa</div>
                    <p className="text-sm font-medium">Poppins</p>
                    <p className="text-xs text-muted-foreground">Regular 400</p>
                  </div>
                  <div className="text-center p-6 bg-muted/30 rounded-lg">
                    <div className="text-6xl mb-2" style={{ fontWeight: 500 }}>Aa</div>
                    <p className="text-sm font-medium">Poppins</p>
                    <p className="text-xs text-muted-foreground">Medium 500</p>
                  </div>
                  <div className="text-center p-6 bg-muted/30 rounded-lg">
                    <div className="text-6xl mb-2" style={{ fontWeight: 600 }}>Aa</div>
                    <p className="text-sm font-medium">Poppins</p>
                    <p className="text-xs text-muted-foreground">Semibold 600</p>
                  </div>
                  <div className="text-center p-6 bg-muted/30 rounded-lg">
                    <div className="text-6xl mb-2" style={{ fontWeight: 700 }}>Aa</div>
                    <p className="text-sm font-medium">Poppins</p>
                    <p className="text-xs text-muted-foreground">Bold 700</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Hierarchy Table */}
              <div>
                <h3 className="mb-4 text-muted-foreground uppercase tracking-wider text-xs">Hierarchy</h3>
                
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-4 mb-4 pb-2 border-b text-xs text-muted-foreground uppercase tracking-wider">
                  <div>Style</div>
                  <div>Typeface</div>
                  <div>Weight</div>
                  <div>Size</div>
                  <div>Line Height</div>
                  <div>Use</div>
                </div>

                {/* Table Rows */}
                <div className="space-y-6">
                  {typography.map((type, index) => (
                    <div key={index} className="grid grid-cols-6 gap-4 items-start pb-4 border-b last:border-b-0">
                      <div className="font-medium text-sm">{type.tag.toUpperCase()}</div>
                      <div className="text-sm text-muted-foreground">Poppins</div>
                      <div className="text-sm text-muted-foreground">{type.weight}</div>
                      <div className="text-sm text-muted-foreground">{type.size}</div>
                      <div className="text-sm text-muted-foreground">{type.lineHeight}</div>
                      <div className="text-sm text-muted-foreground">{type.use || '-'}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Heading Examples */}
              <div>
                <h3 className="mb-6 text-muted-foreground uppercase tracking-wider text-xs">Heading Examples</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">H1 - 56px Bold</p>
                    <h1>H1 Headline</h1>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">H2 - 40px Bold</p>
                    <h2>H2 Headline</h2>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">H3 - 28px Medium</p>
                    <h3>H3 Headline</h3>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">H4 - 26px Regular</p>
                    <h4>H4 Headline</h4>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">H5 - 22px Regular</p>
                    <h5>H5 Headline</h5>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">H6 - 20px Regular</p>
                    <h6>H6 Headline</h6>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Body Text Examples */}
              <div>
                <h3 className="mb-6 text-muted-foreground uppercase tracking-wider text-xs">Body Text Examples</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Body Large - 18px Medium</p>
                    <p style={{ fontSize: '18px', fontWeight: 500, lineHeight: '27px' }}>
                      Body Large: The quick brown fox jumps over the lazy dog
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Body Medium - 14px Medium</p>
                    <p style={{ fontSize: '14px', fontWeight: 500, lineHeight: '20px' }}>
                      Body Medium: The quick brown fox jumps over the lazy dog
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Body Small - 12px Regular</p>
                    <p style={{ fontSize: '12px', fontWeight: 400, lineHeight: '18px' }}>
                      Body Small: The quick brown fox jumps over the lazy dog
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Button Text - 14px Semibold</p>
                    <p style={{ fontSize: '14px', fontWeight: 600, lineHeight: '21px' }}>
                      Button Text
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </Card>
        </section>

        {/* Buttons */}
        <section>
          <div className="mb-6">
            <h2 className="mb-2">Buttons</h2>
            <p className="text-muted-foreground">
              All button variants and sizes with their use cases
            </p>
          </div>

          <Tabs defaultValue="variants" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="sizes">Sizes</TabsTrigger>
              <TabsTrigger value="states">States</TabsTrigger>
              <TabsTrigger value="icons">With Icons</TabsTrigger>
            </TabsList>

            <TabsContent value="variants">
              <Card className="p-6 bg-white">
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3">Default (Primary)</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Used for primary actions like submit, save, and confirm
                    </p>
                    <Button>Primary Button</Button>
                    <code className="ml-4 text-xs bg-muted px-2 py-1 rounded">variant="default"</code>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="mb-3">Secondary</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Used for secondary actions and alternative options
                    </p>
                    <Button variant="secondary">Secondary Button</Button>
                    <code className="ml-4 text-xs bg-muted px-2 py-1 rounded">variant="secondary"</code>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="mb-3">Outline</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Used for tertiary actions and cancel buttons
                    </p>
                    <Button variant="outline">Outline Button</Button>
                    <code className="ml-4 text-xs bg-muted px-2 py-1 rounded">variant="outline"</code>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="mb-3">Destructive</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Used for delete, remove, and other destructive actions
                    </p>
                    <Button variant="destructive">Destructive Button</Button>
                    <code className="ml-4 text-xs bg-muted px-2 py-1 rounded">variant="destructive"</code>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="mb-3">Ghost</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Used for subtle actions and menu items
                    </p>
                    <Button variant="ghost">Ghost Button</Button>
                    <code className="ml-4 text-xs bg-muted px-2 py-1 rounded">variant="ghost"</code>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="mb-3">Link</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Used for inline text links and navigation
                    </p>
                    <Button variant="link">Link Button</Button>
                    <code className="ml-4 text-xs bg-muted px-2 py-1 rounded">variant="link"</code>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="sizes">
              <Card className="p-6 bg-white">
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3">Small</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Compact size for dense UIs and inline actions (h-8)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm">Small Default</Button>
                      <Button size="sm" variant="secondary">Small Secondary</Button>
                      <Button size="sm" variant="outline">Small Outline</Button>
                    </div>
                    <code className="mt-3 block text-xs bg-muted px-2 py-1 rounded w-fit">size="sm"</code>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="mb-3">Default</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Standard size for most use cases (h-9)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button>Default</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                    </div>
                    <code className="mt-3 block text-xs bg-muted px-2 py-1 rounded w-fit">size="default"</code>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="mb-3">Large</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Prominent size for important CTAs (h-10)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="lg">Large Default</Button>
                      <Button size="lg" variant="secondary">Large Secondary</Button>
                      <Button size="lg" variant="outline">Large Outline</Button>
                    </div>
                    <code className="mt-3 block text-xs bg-muted px-2 py-1 rounded w-fit">size="lg"</code>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="mb-3">Icon</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Square button for icon-only actions (size-9)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="icon"><Settings className="w-4 h-4" /></Button>
                      <Button size="icon" variant="secondary"><User className="w-4 h-4" /></Button>
                      <Button size="icon" variant="outline"><FileText className="w-4 h-4" /></Button>
                    </div>
                    <code className="mt-3 block text-xs bg-muted px-2 py-1 rounded w-fit">size="icon"</code>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="states">
              <Card className="p-6 bg-white">
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3">Normal State</h4>
                    <Button>Normal Button</Button>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="mb-3">Hover State</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Hover over buttons to see the transition effect
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button>Hover Me</Button>
                      <Button variant="secondary">Hover Me</Button>
                      <Button variant="outline">Hover Me</Button>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="mb-3">Disabled State</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Reduced opacity and no pointer events
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button disabled>Disabled</Button>
                      <Button variant="secondary" disabled>Disabled</Button>
                      <Button variant="outline" disabled>Disabled</Button>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="mb-3">Focus State</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Tab through buttons to see the focus ring
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button>Focus Me</Button>
                      <Button variant="secondary">Focus Me</Button>
                      <Button variant="outline">Focus Me</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="icons">
              <Card className="p-6 bg-white">
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3">Icon + Text</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Common pattern for action buttons
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button><Download className="w-4 h-4" />Download</Button>
                      <Button variant="secondary"><Upload className="w-4 h-4" />Upload</Button>
                      <Button variant="outline"><Settings className="w-4 h-4" />Settings</Button>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="mb-3">Icon Only</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Use size="icon" for square icon buttons
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="icon"><Home className="w-4 h-4" /></Button>
                      <Button size="icon" variant="secondary"><User className="w-4 h-4" /></Button>
                      <Button size="icon" variant="outline"><BarChart3 className="w-4 h-4" /></Button>
                      <Button size="icon" variant="destructive"><XCircle className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="mb-3">Different Sizes with Icons</h4>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-muted-foreground w-20">Small:</span>
                        <Button size="sm"><CheckCircle2 className="w-4 h-4" />Approve</Button>
                        <Button size="sm" variant="outline"><XCircle className="w-4 h-4" />Reject</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-muted-foreground w-20">Default:</span>
                        <Button><CheckCircle2 className="w-4 h-4" />Approve</Button>
                        <Button variant="outline"><XCircle className="w-4 h-4" />Reject</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-muted-foreground w-20">Large:</span>
                        <Button size="lg"><CheckCircle2 className="w-4 h-4" />Approve</Button>
                        <Button size="lg" variant="outline"><XCircle className="w-4 h-4" />Reject</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Badges */}
        <section>
          <div className="mb-6">
            <h2 className="mb-2">Badges</h2>
            <p className="text-muted-foreground">
              Status indicators and labels with various styles
            </p>
          </div>

          <Card className="p-6 bg-white">
            <div className="space-y-6">
              <div>
                <h4 className="mb-3">Default (Primary)</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default Badge</Badge>
                  <Badge>Approved</Badge>
                  <Badge><CheckCircle2 className="w-3 h-3" />Active</Badge>
                </div>
                <code className="mt-3 block text-xs bg-muted px-2 py-1 rounded w-fit">variant="default"</code>
              </div>
              <Separator />
              <div>
                <h4 className="mb-3">Secondary</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Secondary Badge</Badge>
                  <Badge variant="secondary">Pending</Badge>
                  <Badge variant="secondary"><Info className="w-3 h-3" />Info</Badge>
                </div>
                <code className="mt-3 block text-xs bg-muted px-2 py-1 rounded w-fit">variant="secondary"</code>
              </div>
              <Separator />
              <div>
                <h4 className="mb-3">Outline</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Outline Badge</Badge>
                  <Badge variant="outline">Draft</Badge>
                  <Badge variant="outline"><AlertCircle className="w-3 h-3" />Warning</Badge>
                </div>
                <code className="mt-3 block text-xs bg-muted px-2 py-1 rounded w-fit">variant="outline"</code>
              </div>
              <Separator />
              <div>
                <h4 className="mb-3">Destructive</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="destructive">Destructive Badge</Badge>
                  <Badge variant="destructive">Rejected</Badge>
                  <Badge variant="destructive"><XCircle className="w-3 h-3" />Error</Badge>
                </div>
                <code className="mt-3 block text-xs bg-muted px-2 py-1 rounded w-fit">variant="destructive"</code>
              </div>
            </div>
          </Card>
        </section>

        {/* Form Components */}
        <section>
          <div className="mb-6">
            <h2 className="mb-2">Form Components</h2>
            <p className="text-muted-foreground">
              Input fields, selects, and other form elements
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white">
              <h3 className="mb-4">Text Input</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div>
                  <Label htmlFor="disabled">Disabled Input</Label>
                  <Input id="disabled" placeholder="Disabled" disabled />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white">
              <h3 className="mb-4">Textarea</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Enter a description" 
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="disabled-textarea">Disabled Textarea</Label>
                  <Textarea 
                    id="disabled-textarea" 
                    placeholder="Disabled" 
                    disabled
                    rows={2}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white">
              <h3 className="mb-4">Select</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="qa">QA Officer</SelectItem>
                      <SelectItem value="cfo">CFO</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white">
              <h3 className="mb-4">Checkbox & Switch</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={checkboxState}
                    onCheckedChange={(checked) => setCheckboxState(checked as boolean)}
                  />
                  <Label htmlFor="terms">Accept terms and conditions</Label>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">Enable notifications</Label>
                  <Switch 
                    id="notifications"
                    checked={switchState}
                    onCheckedChange={setSwitchState}
                  />
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Alerts */}
        <section>
          <div className="mb-6">
            <h2 className="mb-2">Alerts</h2>
            <p className="text-muted-foreground">
              System messages and notifications
            </p>
          </div>

          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                This is an informational message to guide users.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Something went wrong. Please try again or contact support.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Progress & Slider */}
        <section>
          <div className="mb-6">
            <h2 className="mb-2">Progress Indicators</h2>
            <p className="text-muted-foreground">
              Visual feedback for loading and progress states
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white">
              <h3 className="mb-4">Progress Bar</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>25% Complete</Label>
                    <span className="text-sm text-muted-foreground">25%</span>
                  </div>
                  <Progress value={25} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>50% Complete</Label>
                    <span className="text-sm text-muted-foreground">50%</span>
                  </div>
                  <Progress value={50} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>75% Complete</Label>
                    <span className="text-sm text-muted-foreground">75%</span>
                  </div>
                  <Progress value={75} />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white">
              <h3 className="mb-4">Slider</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Value: {sliderValue[0]}</Label>
                  </div>
                  <Slider 
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Cards */}
        <section>
          <div className="mb-6">
            <h2 className="mb-2">Cards</h2>
            <p className="text-muted-foreground">
              Container components for grouping related content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-6 bg-white">
              <h3 className="mb-2">Basic Card</h3>
              <p className="text-sm text-muted-foreground">
                Simple card with title and description
              </p>
            </Card>

            <Card className="p-6 bg-white">
              <h3 className="mb-2">Card with Badge</h3>
              <Badge className="mb-2">Active</Badge>
              <p className="text-sm text-muted-foreground">
                Card with status badge
              </p>
            </Card>

            <Card className="p-6 bg-white">
              <h3 className="mb-2">Card with Button</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Card with action button
              </p>
              <Button size="sm" className="w-full">View Details</Button>
            </Card>
          </div>
        </section>

        {/* Spacing & Layout */}
        <section>
          <div className="mb-6">
            <h2 className="mb-2">Spacing System</h2>
            <p className="text-muted-foreground">
              Consistent spacing using Tailwind's spacing scale
            </p>
          </div>

          <Card className="p-6 bg-white">
            <div className="space-y-4">
              <div>
                <h4 className="mb-2">Common Spacing Values</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-4">
                    <code className="bg-muted px-2 py-1 rounded w-20">gap-2</code>
                    <span className="text-muted-foreground">8px - Between inline elements</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <code className="bg-muted px-2 py-1 rounded w-20">gap-4</code>
                    <span className="text-muted-foreground">16px - Between cards/sections</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <code className="bg-muted px-2 py-1 rounded w-20">gap-6</code>
                    <span className="text-muted-foreground">24px - Between major sections</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <code className="bg-muted px-2 py-1 rounded w-20">p-4</code>
                    <span className="text-muted-foreground">16px - Small card padding</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <code className="bg-muted px-2 py-1 rounded w-20">p-6</code>
                    <span className="text-muted-foreground">24px - Standard card padding</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <code className="bg-muted px-2 py-1 rounded w-20">p-8</code>
                    <span className="text-muted-foreground">32px - Large section padding</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Responsive Design */}
        <section>
          <div className="mb-6">
            <h2 className="mb-2">Responsive Design</h2>
            <p className="text-muted-foreground">
              Mobile-first approach with Tailwind breakpoints
            </p>
          </div>

          <Card className="p-6 bg-white">
            <div className="space-y-4">
              <div>
                <h4 className="mb-2">Breakpoints</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-4">
                    <code className="bg-muted px-2 py-1 rounded w-20">sm:</code>
                    <span className="text-muted-foreground">640px - Small devices</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <code className="bg-muted px-2 py-1 rounded w-20">md:</code>
                    <span className="text-muted-foreground">768px - Tablets</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <code className="bg-muted px-2 py-1 rounded w-20">lg:</code>
                    <span className="text-muted-foreground">1024px - Desktop</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <code className="bg-muted px-2 py-1 rounded w-20">xl:</code>
                    <span className="text-muted-foreground">1280px - Large desktop</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Usage Guidelines */}
        <section>
          <div className="mb-6">
            <h2 className="mb-2">Usage Guidelines</h2>
            <p className="text-muted-foreground">
              Best practices for implementing the design system
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-6 bg-white">
              <h3 className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Do's
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Use #023F40 for all primary brand elements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Maintain consistent spacing using the spacing scale</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Use appropriate button variants for different actions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Ensure sufficient color contrast for accessibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Use Poppins font family throughout the interface</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-white">
              <h3 className="mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Don'ts
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span>Don't use custom colors outside the defined palette</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span>Don't override font sizes without using the typography scale</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span>Don't create custom button styles - use existing variants</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span>Don't use destructive buttons for non-destructive actions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span>Don't ignore responsive design considerations</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Input States - All Variants */}
        <DemoInputStates />

        {/* Textarea States */}
        <DemoTextareaStates />

        {/* File Uploads */}
        <DemoFileUploads />

        {/* Download Buttons */}
        <DemoDownloadButtons />

        {/* Modals */}
        <DemoModals />

        {/* Code Examples */}
        <section>
          <div className="mb-6">
            <h2 className="mb-2">Code Examples</h2>
            <p className="text-muted-foreground">
              Common implementation patterns
            </p>
          </div>

          <div className="space-y-4">
            <Card className="p-6 bg-white">
              <h3 className="mb-3">Button with Icon</h3>
              <div className="space-y-3">
                <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`import { Button } from './components/ui/button';
import { Download } from 'lucide-react';

<Button>
  <Download className="w-4 h-4" />
  Download Report
</Button>`}
                </pre>
                <div>
                  <Button><Download className="w-4 h-4" />Download Report</Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white">
              <h3 className="mb-3">Status Badge</h3>
              <div className="space-y-3">
                <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`import { Badge } from './components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

<Badge>
  <CheckCircle2 className="w-3 h-3" />
  Approved
</Badge>`}
                </pre>
                <div>
                  <Badge><CheckCircle2 className="w-3 h-3" />Approved</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white">
              <h3 className="mb-3">Form Field</h3>
              <div className="space-y-3">
                <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`import { Label } from './components/ui/label';
import { Input } from './components/ui/input';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="Enter your email" 
  />
</div>`}
                </pre>
                <div className="space-y-2">
                  <Label htmlFor="email-example">Email</Label>
                  <Input 
                    id="email-example" 
                    type="email" 
                    placeholder="Enter your email" 
                  />
                </div>
              </div>
            </Card>
          </div>
        </section>

      </div>

      {/* Footer */}
      <div className="bg-[#023F40] text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-white/80">
              MFA Rebate Scheme System Design System v1.0
            </p>
            <p className="text-sm text-white/60 mt-2">
              Last updated: December 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}