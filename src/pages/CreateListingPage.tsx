import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { ListingCategory, ListingCondition, ListingType } from '../types';
import {
  Upload,
  Calendar,
  Repeat,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  Eye,
  Camera,
  Star,
  MapPin,
  Loader2,
  ShieldCheck,
  Tag,
  Clock,
  FileCheck,
  FileText,
  AlertCircle,
  ChevronDown,
  Wrench,
  Package,
  ImagePlus,
} from 'lucide-react';
import {
  CONDITIONS,
  DEFECT_OPTIONS,
  PRODUCT_ONLY,
  getAccessoryOptions,
  validateImageFile,
} from '../services/conditionOptions';
import { uploadImages } from '../services/storage';
import { DefectType } from '../types';
import {
  DEFAULT_CAMPUS_LOCATION,
  formatApproximateLocation,
} from '../services/locationDefaults';
import { CategoryFallbackArtwork } from '../components/marketplace/CategoryFallbackArtwork';

/** Yes / No / Not specified selector – "not specified" is never treated as "no". */
const TriStateField: React.FC<{
  label: string;
  value: boolean | undefined;
  onChange: (v: boolean | undefined) => void;
}> = ({ label, value, onChange }) => (
  <div className="p-3 rounded-xl bg-narmis-forestDark border border-narmis-mountain/50">
    <span className="block text-xs font-semibold text-narmis-parchment mb-2">{label}</span>
    <div className="flex gap-1.5">
      {[
        { v: true, l: 'Yes' },
        { v: false, l: 'No' },
        { v: undefined, l: 'Not specified' },
      ].map((opt) => (
        <button
          key={opt.l}
          type="button"
          onClick={() => onChange(opt.v)}
          className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
            value === opt.v
              ? 'bg-narmis-gold text-narmis-charcoal border-narmis-gold'
              : 'bg-narmis-surface text-narmis-cream/70 border-narmis-mountain/60 hover:border-narmis-gold/50'
          }`}
        >
          {opt.l}
        </button>
      ))}
    </div>
  </div>
);

/** Collapsible section so the long form stays manageable. */
const Section: React.FC<{
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, subtitle, icon, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-narmis-mountain/60 bg-narmis-forestDark/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-narmis-mountain/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-narmis-mountain/60 text-narmis-gold shrink-0">{icon}</div>
          <div>
            <h3 className="font-serif text-base font-bold text-narmis-parchment">{title}</h3>
            {subtitle && <p className="text-[11px] text-narmis-cream/60">{subtitle}</p>}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-narmis-gold transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-4 pt-0 space-y-4">{children}</div>}
    </div>
  );
};

const CATEGORIES: ListingCategory[] = [
  'Electronics',
  'Computers and Accessories',
  'Books',
  'Tools and Equipment',
  'Photography',
  'Gaming',
  'Sports Equipment',
  'Cricket Equipment',
  'Fashion & Apparel',
  'Furniture',
  'Other',
];

const AGE_OPTIONS = [
  'Less than 1 month',
  '1 – 3 months',
  '3 – 6 months',
  '6 – 12 months',
  '1 – 2 years',
  '2 – 3 years',
  '3+ years',
  'Custom',
];

const WARRANTY_OPTIONS = [
  'Manufacturer Warranty Active',
  'Brand Warranty Remaining (Under 6 Months)',
  'Brand Warranty Remaining (6-12 Months)',
  'Seller / Shop Warranty',
  'Warranty Expired',
  'No Warranty',
];

export const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addListing, updateListing, getListing, fetchListingById } = useMarketplace();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Edit mode: /create-listing?edit=<listingId>
  const editId = searchParams.get('edit');
  const editingListing = editId ? getListing(editId) : undefined;
  const isEditMode = Boolean(editId);
  const [hydrated, setHydrated] = useState(false);
  const [isLoadingEditTarget, setIsLoadingEditTarget] = useState<boolean>(
    Boolean(editId && !editingListing)
  );

  useEffect(() => {
    if (!editId || editingListing) {
      setIsLoadingEditTarget(false);
      return;
    }
    let active = true;
    setIsLoadingEditTarget(true);
    fetchListingById(editId).finally(() => {
      if (active) setIsLoadingEditTarget(false);
    });
    return () => {
      active = false;
    };
  }, [editId, editingListing, fetchListingById]);

  // Wizard Step: 1 = Basic & Description, 2 = Condition, Accessories & Specs, 3 = Pricing Model, 4 = Images & Publish
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State: Basic
  const [title, setTitle] = useState(searchParams.get('title') || '');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ListingCategory>('Electronics');
  const [condition, setCondition] = useState<ListingCondition>('Excellent');
  const [listingType, setListingType] = useState<ListingType>(
    (searchParams.get('type') as ListingType) || 'rent'
  );

  // Form State: Technical Details & Age
  const [brand, setBrand] = useState('');
  const [modelName, setModelName] = useState('');
  const [productAgeSelect, setProductAgeSelect] = useState('1 – 3 months');
  const [productAgeCustom, setProductAgeCustom] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyStatus, setWarrantyStatus] = useState('Not specified');
  const [invoiceAvailable, setInvoiceAvailable] = useState<boolean | undefined>(undefined);

  // Form State: Wear & Tear / Defects (empty = seller did not answer, never assumed "no damage")
  const [defects, setDefects] = useState<DefectType[]>([]);
  const [defectOther, setDefectOther] = useState('');
  const [defectDescription, setDefectDescription] = useState('');

  // Form State: What's Included
  const [includedItems, setIncludedItems] = useState<string[]>([]);
  const [includedCustom, setIncludedCustom] = useState('');
  const [missingAccessories, setMissingAccessories] = useState('');
  const [hasMissingAccessories, setHasMissingAccessories] = useState<boolean | undefined>(undefined);

  // Form State: Packaging & documentation
  const [packagingAvailable, setPackagingAvailable] = useState<boolean | undefined>(undefined);
  const [warrantyValid, setWarrantyValid] = useState<boolean | undefined>(undefined);
  const [documentationNotes, setDocumentationNotes] = useState('');

  // Form State: Condition / defect photos (genuine photos only, no placeholders)
  const [conditionImages, setConditionImages] = useState<string[]>([]);
  const conditionInputRef = useRef<HTMLInputElement>(null);

  // Form State: Pricing (Strings to avoid zero digit bug)
  const [originalMrpStr, setOriginalMrpStr] = useState<string>('');
  const [rentalPriceStr, setRentalPriceStr] = useState<string>('500');
  const [rentalDuration, setRentalDuration] = useState<'Hourly' | 'Daily' | 'Weekly'>('Daily');
  const [estimatedValueStr, setEstimatedValueStr] = useState<string>('4000');
  const [tradeDesired, setTradeDesired] = useState('');
  const [tradeCashAdjustmentStr, setTradeCashAdjustmentStr] = useState<string>('0');
  const [purchasePriceStr, setPurchasePriceStr] = useState<string>('4500');

  // Form State: Location & Geolocation
  const [location, setLocation] = useState(user?.location || DEFAULT_CAMPUS_LOCATION);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState('');

  // Form State: Images (Clean empty array, NO fake default camera photo!)
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form State: Terms Agreement (Must be unchecked by default)
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Prefill the form when editing an existing listing
  useEffect(() => {
    if (!editingListing || hydrated) return;
    const l = editingListing;
    setTitle(l.title);
    setDescription(l.description);
    setCategory(l.category);
    setCondition(l.condition);
    setListingType(l.listing_type);
    setBrand(l.brand || '');
    setModelName(l.model_name || '');
    if (l.product_age && AGE_OPTIONS.includes(l.product_age)) {
      setProductAgeSelect(l.product_age);
    } else if (l.product_age) {
      setProductAgeSelect('Custom');
      setProductAgeCustom(l.product_age);
    }
    setPurchaseDate(l.purchase_date || '');
    setWarrantyStatus(l.warranty_status || 'Not specified');
    setInvoiceAvailable(l.invoice_available);
    setDefects(l.defects || []);
    setDefectOther(l.defect_other || '');
    setDefectDescription(l.defect_description || '');
    setIncludedItems(l.included_items || []);
    setIncludedCustom(l.included_custom || '');
    setMissingAccessories(l.missing_accessories || '');
    setHasMissingAccessories(l.missing_accessories ? true : undefined);
    setPackagingAvailable(l.packaging_available);
    setWarrantyValid(l.warranty_valid);
    setDocumentationNotes(l.documentation_notes || '');
    setConditionImages(l.condition_images || []);
    setOriginalMrpStr(l.original_mrp ? String(l.original_mrp) : '');
    if (l.rental_price !== undefined) setRentalPriceStr(String(l.rental_price));
    if (l.rental_duration) setRentalDuration(l.rental_duration);
    if (l.estimated_value !== undefined) setEstimatedValueStr(String(l.estimated_value));
    setTradeDesired(l.trade_desired || '');
    if (l.trade_cash_adjustment !== undefined) setTradeCashAdjustmentStr(String(l.trade_cash_adjustment));
    if (l.purchase_price !== undefined) setPurchasePriceStr(String(l.purchase_price));
    setLocation(l.location);
    setImages(l.images || []);
    setAgreeTerms(Boolean(l.terms_accepted));
    setHydrated(true);
  }, [editingListing, hydrated]);

  // Defect toggling: "No visible damage" is mutually exclusive with actual defects
  const toggleDefect = (d: DefectType) => {
    setDefects((prev) => {
      if (prev.includes(d)) return prev.filter((x) => x !== d);
      if (d === 'No visible damage') return ['No visible damage'];
      return [...prev.filter((x) => x !== 'No visible damage'), d];
    });
  };

  // Accessory toggling: "Product only" is mutually exclusive with accessories
  const toggleIncluded = (item: string) => {
    setIncludedItems((prev) => {
      if (prev.includes(item)) return prev.filter((x) => x !== item);
      if (item === PRODUCT_ONLY) return [PRODUCT_ONLY];
      return [...prev.filter((x) => x !== PRODUCT_ONLY), item];
    });
  };

  const accessoryOptions = getAccessoryOptions(category);
  // Keep previously-selected items visible even if the category changes
  const visibleAccessoryOptions = Array.from(new Set([...accessoryOptions, ...includedItems]));

  const handleConditionFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setErrorMsg('');
    Array.from(fileList).forEach((file) => {
      const err = validateImageFile(file);
      if (err) {
        setErrorMsg(err);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) setConditionImages((prev) => [...prev, reader.result as string].slice(0, 10));
      };
      reader.readAsDataURL(file);
    });
  };

  // Geolocation handler (Browser reverse geocoding with privacy protection)
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser. Please enter location manually.');
      return;
    }

    setIsLocating(true);
    setErrorMsg('');
    setLocationSuccessMsg('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocode using free OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );

          if (response.ok) {
            const data = await response.json();
            const detected = formatApproximateLocation(data.address || {});
            setLocation(detected);
            setLocationSuccessMsg(`Detected approximate area: ${detected}`);
          } else {
            setLocation(DEFAULT_CAMPUS_LOCATION);
            setLocationSuccessMsg('Campus location suggestion applied.');
          }
        } catch (err) {
          console.warn('Geocoding service unavailable, fallback:', err);
          setLocation(DEFAULT_CAMPUS_LOCATION);
          setLocationSuccessMsg('Default campus location set; edit manually if needed.');
        } finally {
          setIsLocating(false);
        }
      },
      (geoErr) => {
        setIsLocating(false);
        let msg = 'Location access was not granted. You can type your location manually below.';
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please enter your neighborhood or city manually.';
        } else if (geoErr.code === geoErr.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable. Please enter it manually.';
        }
        setErrorMsg(msg);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  // Helper to handle numeric string inputs cleanly
  const handleNumericInput = (val: string, setter: (val: string) => void) => {
    // Only allow digits or single decimal point, no negative signs
    const cleaned = val.replace(/[^0-9.]/g, '');
    setter(cleaned);
  };

  // Process a list of File objects into base64 data URLs
  const processFiles = (fileList: FileList | File[]) => {
    setErrorMsg('');
    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Only image files (JPG, PNG, WEBP) are supported.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Image size should be below 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(files);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const finalProductAge = productAgeSelect === 'Custom' ? productAgeCustom.trim() : productAgeSelect;

  // Validation before publishing
  const handleSubmitListing = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please provide a listing title and detailed description.');
      setCurrentStep(1);
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('You must review and agree to the Product Care and Damage Responsibility Policy.');
      return;
    }

    // Price parsing and validation
    const parsedRentalPrice = parseFloat(rentalPriceStr);
    const parsedEstimatedValue = parseFloat(estimatedValueStr);
    const parsedPurchasePrice = parseFloat(purchasePriceStr);
    const parsedOriginalMrp = originalMrpStr ? parseFloat(originalMrpStr) : undefined;
    const parsedCashAdjustment = parseFloat(tradeCashAdjustmentStr) || 0;

    if (listingType === 'rent' && (isNaN(parsedRentalPrice) || parsedRentalPrice <= 0)) {
      setErrorMsg('Please enter a valid positive rental price.');
      setCurrentStep(3);
      return;
    }

    if (listingType === 'trade' && (isNaN(parsedEstimatedValue) || parsedEstimatedValue <= 0)) {
      setErrorMsg('Please enter a valid estimated trade value.');
      setCurrentStep(3);
      return;
    }

    if (listingType === 'purchase' && (isNaN(parsedPurchasePrice) || parsedPurchasePrice <= 0)) {
      setErrorMsg('Please enter a valid positive selling price.');
      setCurrentStep(3);
      return;
    }

    if (parsedOriginalMrp !== undefined && parsedOriginalMrp <= 0) {
      setErrorMsg('Original retail MRP must be a positive number if specified.');
      setCurrentStep(2);
      return;
    }

    // Check impossible future purchase date
    if (purchaseDate) {
      const selected = new Date(purchaseDate);
      const today = new Date();
      if (selected > today) {
        setErrorMsg('Purchase date cannot be in the future.');
        setCurrentStep(2);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (!user) {
        throw new Error('Please sign in to upload images and publish a listing.');
      }

      const uploadedProductImages = await uploadImages(images, user.id, 'product');
      const uploadedConditionImages =
        conditionImages.length > 0
          ? await uploadImages(conditionImages, user.id, 'condition')
          : [];

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        condition,
        listingType: listingType,
        listing_type: listingType,
        brand: brand.trim() || undefined,
        model_name: modelName.trim() || undefined,
        product_age: finalProductAge || undefined,
        purchase_date: purchaseDate || undefined,
        original_mrp: parsedOriginalMrp,
        defects: defects.length > 0 ? defects : undefined,
        defect_other: defects.includes('Other') ? defectOther.trim() || undefined : undefined,
        defect_description: defectDescription.trim() || undefined,
        included_items: includedItems.length > 0 ? includedItems : undefined,
        included_custom: includedCustom.trim() || undefined,
        missing_accessories: missingAccessories.trim() || undefined,
        packaging_available: packagingAvailable,
        warranty_valid: warrantyValid,
        warranty_status: warrantyStatus,
        invoice_available: invoiceAvailable,
        documentation_notes: documentationNotes.trim() || undefined,
        condition_images: uploadedConditionImages,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        terms_version: 'v1.0',
        rental_price: listingType === 'rent' ? parsedRentalPrice : undefined,
        rental_duration: listingType === 'rent' ? rentalDuration : undefined,
        availability_status: 'available',
        estimated_value: listingType === 'trade' ? parsedEstimatedValue : undefined,
        trade_desired: listingType === 'trade' ? tradeDesired.trim() : undefined,
        trade_cash_adjustment: listingType === 'trade' ? parsedCashAdjustment : undefined,
        purchase_price: listingType === 'purchase' ? parsedPurchasePrice : undefined,
        images: uploadedProductImages,
        location: location.trim() || DEFAULT_CAMPUS_LOCATION,
        featured: false,
      };

      if (isEditMode && editingListing) {
        await updateListing(editingListing.id, payload as any);
        navigate(`/product/${editingListing.id}`);
      } else {
        const created = await addListing(payload as any);
        navigate(`/product/${created.id}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || isLoadingEditTarget) {
    return (
      <div className="pt-32 pb-24 bg-narmis-bg min-h-screen flex flex-col items-center justify-center gap-3 text-narmis-cream">
        <Loader2 className="w-8 h-8 text-narmis-gold animate-spin" />
        <p className="text-sm text-narmis-cream/70">
          {isLoadingEditTarget ? 'Loading listing from Supabase...' : 'Checking your session...'}
        </p>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 bg-narmis-bg min-h-screen text-narmis-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-narmis-surface border border-narmis-gold/30 text-xs font-semibold uppercase tracking-wider text-narmis-gold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Circular Economy Creator</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-narmis-parchment">
            {isEditMode ? 'Edit Your Listing' : 'Create a New Listing'}
          </h1>
          <p className="text-xs sm:text-sm text-narmis-cream/70 mt-2">
            Give your equipment, electronics, fashion, or gear more than one life.
          </p>
        </div>

        {/* Wizard Stepper Bar (4 Clean Steps) */}
        <div className="bg-narmis-surface rounded-2xl p-4 border border-narmis-mountain/60 shadow-lg mb-8">
          <div className="flex items-center justify-between max-w-lg mx-auto text-xs">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-narmis-gold font-bold' : 'text-narmis-cream/50'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-narmis-gold text-narmis-charcoal' : 'bg-narmis-forestDark text-narmis-cream/50'}`}>
                1
              </div>
              <span className="hidden sm:inline">Overview</span>
            </div>

            <div className={`h-0.5 w-8 sm:w-16 ${currentStep >= 2 ? 'bg-narmis-gold' : 'bg-narmis-mountain'}`} />

            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-narmis-gold font-bold' : 'text-narmis-cream/50'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-narmis-gold text-narmis-charcoal' : 'bg-narmis-forestDark text-narmis-cream/50'}`}>
                2
              </div>
              <span className="hidden sm:inline">Specs & Age</span>
            </div>

            <div className={`h-0.5 w-8 sm:w-16 ${currentStep >= 3 ? 'bg-narmis-gold' : 'bg-narmis-mountain'}`} />

            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-narmis-gold font-bold' : 'text-narmis-cream/50'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${currentStep >= 3 ? 'bg-narmis-gold text-narmis-charcoal' : 'bg-narmis-forestDark text-narmis-cream/50'}`}>
                3
              </div>
              <span className="hidden sm:inline">Pricing</span>
            </div>

            <div className={`h-0.5 w-8 sm:w-16 ${currentStep >= 4 ? 'bg-narmis-gold' : 'bg-narmis-mountain'}`} />

            <div className={`flex items-center gap-2 ${currentStep >= 4 ? 'text-narmis-gold font-bold' : 'text-narmis-cream/50'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${currentStep >= 4 ? 'bg-narmis-gold text-narmis-charcoal' : 'bg-narmis-forestDark text-narmis-cream/50'}`}>
                4
              </div>
              <span className="hidden sm:inline">Photos & Terms</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/70 border border-red-500/60 text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Wizard Form Panels */}
        <div className="bg-narmis-surface rounded-3xl p-6 sm:p-10 border border-narmis-mountain/60 shadow-2xl">
          {/* STEP 1: Basic Information & Condition */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="pb-3 border-b border-narmis-mountain/40 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-narmis-parchment">
                    Step 1: Product Overview
                  </h2>
                  <p className="text-xs text-narmis-cream/70">
                    Basic identification, category, and physical condition.
                  </p>
                </div>
                <span className="text-xs text-narmis-gold font-bold">1 of 4</span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90 mb-2">
                  Product Name / Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sony Alpha 7 IV Full-Frame Camera / Keychron Q1 Pro Mechanical Keyboard"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90 mb-2">
                    Product Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ListingCategory)}
                    className="w-full px-4 py-3 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-narmis-surface">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90 mb-2">
                    Product Condition *
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ListingCondition)}
                    className="w-full px-4 py-3 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold cursor-pointer"
                  >
                    {CONDITIONS.map((cond) => (
                      <option key={cond} value={cond} className="bg-narmis-surface">
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90 mb-2">
                  Detailed Product Description *
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide technical specifications, usage history, cosmetic state, and pickup instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold resize-none"
                  required
                />
              </div>

              {/* Location with Geolocation Button */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90">
                    Product Location (Neighborhood / City) *
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-narmis-mountain hover:bg-narmis-mountain/80 border border-narmis-gold/30 text-xs font-semibold text-narmis-gold transition-all"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Detecting...</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-narmis-gold" />
                        <span>Use My Current Location</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  type="text"
                  placeholder={DEFAULT_CAMPUS_LOCATION}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                  required
                />
                {locationSuccessMsg && (
                  <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{locationSuccessMsg}</span>
                  </p>
                )}
                <p className="text-[11px] text-narmis-cream/60 mt-1">
                  Privacy notice: Only approximate locality/city is visible publicly, never exact GPS coordinates or private door addresses.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!title.trim() || !description.trim()) {
                      setErrorMsg('Please fill in product name and description.');
                      return;
                    }
                    setErrorMsg('');
                    setCurrentStep(2);
                  }}
                  className="px-8 py-3.5 rounded-full bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg"
                >
                  <span>Next: Technical Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Condition, Wear & Tear, Accessories & Specs */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="pb-3 border-b border-narmis-mountain/40 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-narmis-parchment">
                    Step 2: Condition, Damage & Accessories
                  </h2>
                  <p className="text-xs text-narmis-cream/70">
                    Transparent disclosure of wear, defects, and included items builds community trust.
                  </p>
                </div>
                <span className="text-xs text-narmis-gold font-bold">2 of 4</span>
              </div>

              {/* SECTION: BRAND & MODEL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90 mb-1.5">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sony, Apple, Rigol, Mikasa, Casio"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90 mb-1.5">
                    Model Name / Model Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ILCE-7M4, DS1054Z, V200W, MBA-M2"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                  />
                </div>
              </div>

              {/* SECTION: PRODUCT WEAR & TEAR / DEFECTS */}
              <Section
                title="Product Wear & Tear / Defects"
                subtitle="Disclose scratches, dents, marks, cracks or functional issues"
                icon={<Wrench className="w-5 h-5 text-amber-400" />}
                defaultOpen={true}
              >
                <div>
                  <label className="block text-xs font-semibold text-narmis-parchment mb-2">
                    Does this product have any scratches, dents, marks, cracks, or other visible damage?
                  </label>
                  <p className="text-[11px] text-narmis-cream/60 mb-3">
                    Select all that apply. (If left unselected, it will be marked as "Not specified" — never assumed to have no damage).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DEFECT_OPTIONS.map((opt) => {
                      const isSelected = defects.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleDefect(opt)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs transition-all ${
                            isSelected
                              ? opt === 'No visible damage'
                                ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-200'
                                : 'bg-amber-950/70 border-amber-500/70 text-amber-200'
                              : 'bg-narmis-forestDark border-narmis-mountain/50 text-narmis-cream/80 hover:border-narmis-gold/50'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] shrink-0 ${
                              isSelected
                                ? opt === 'No visible damage'
                                  ? 'bg-emerald-500 border-emerald-500 text-narmis-charcoal'
                                  : 'bg-amber-500 border-amber-500 text-narmis-charcoal'
                                : 'border-narmis-mountain/80 bg-narmis-surface'
                            }`}
                          >
                            {isSelected && '✓'}
                          </div>
                          <span className="font-medium">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* "Other" defect custom description */}
                  {defects.includes('Other') && (
                    <div className="mt-3 animate-fadeIn">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1">
                        Describe the "Other" issue *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Loose volume knob, fading on label, hinge squeaks"
                        value={defectOther}
                        onChange={(e) => setDefectOther(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-narmis-forestDark border border-amber-500/60 text-xs text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                        required
                      />
                    </div>
                  )}

                  {/* Detailed damage description field */}
                  <div className="mt-4">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                      Describe any scratches, defects, or signs of wear (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Explain: Where is the damage located? How noticeable is it? Does it affect functionality? Was the issue present before listing?"
                      value={defectDescription}
                      onChange={(e) => setDefectDescription(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold resize-none"
                    />
                  </div>
                </div>

                {/* DEDICATED DAMAGE PHOTOS UPLOAD */}
                <div className="pt-3 border-t border-narmis-mountain/40">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-narmis-parchment flex items-center gap-1.5">
                        <ImagePlus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Upload Photos of Scratches or Defects (Optional)</span>
                      </span>
                      <p className="text-[11px] text-narmis-cream/60">
                        Shows genuine close-ups in a separate "Condition Photos" gallery.
                      </p>
                    </div>
                    {conditionImages.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setConditionImages([])}
                        className="text-[11px] text-red-400 hover:text-red-300 font-medium"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <input
                    ref={conditionInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      handleConditionFiles(e.target.files);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => conditionInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-narmis-mountain hover:bg-narmis-mountain/80 border border-amber-500/40 text-xs font-semibold text-amber-200 transition-all flex items-center gap-2"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>Add Defect Photos</span>
                    </button>
                    <span className="text-[11px] text-narmis-cream/50">
                      {conditionImages.length} defect photo{conditionImages.length === 1 ? '' : 's'} added
                    </span>
                  </div>

                  {conditionImages.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-3">
                      {conditionImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden border border-amber-500/40 group shadow-sm bg-black"
                        >
                          <img src={img} alt={`Defect ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setConditionImages((prev) => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-red-400 hover:text-red-300"
                            title="Remove photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Section>

              {/* SECTION: WHAT'S INCLUDED? (ACCESSORIES) */}
              <Section
                title="What's Included?"
                subtitle="What items or accessories will the buyer or renter receive?"
                icon={<Package className="w-5 h-5 text-sky-400" />}
                defaultOpen={true}
              >
                <div>
                  <label className="block text-xs font-semibold text-narmis-parchment mb-2">
                    What items or accessories will the buyer or renter receive along with the product?
                  </label>
                  <p className="text-[11px] text-narmis-cream/60 mb-3">
                    Select included accessories for <strong>{category}</strong>, or choose "Product only".
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {visibleAccessoryOptions.map((item) => {
                      const isSelected = includedItems.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleIncluded(item)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? item === PRODUCT_ONLY
                                ? 'bg-amber-950/70 border-amber-500/70 text-amber-200'
                                : 'bg-sky-950/70 border-sky-500/70 text-sky-200'
                              : 'bg-narmis-forestDark border-narmis-mountain/50 text-narmis-cream/80 hover:border-narmis-gold/50'
                          }`}
                        >
                          <span>{isSelected ? '✓' : '+'}</span>
                          <span>{item}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom accessories text field */}
                  <div className="mt-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1">
                      Add Custom / Other Accessories
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Extra 64GB SD card, carrying pouch, extra batteries, HDMI converter"
                      value={includedCustom}
                      onChange={(e) => setIncludedCustom(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                    />
                  </div>
                </div>
              </Section>

              {/* SECTION: ORIGINAL PACKAGING AND DOCUMENTATION */}
              <Section
                title="Original Packaging & Documentation"
                subtitle="Packaging, invoice proof, warranty status, and missing items"
                icon={<FileCheck className="w-5 h-5 text-emerald-400" />}
                defaultOpen={true}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TriStateField
                    label="Is the original packaging available?"
                    value={packagingAvailable}
                    onChange={setPackagingAvailable}
                  />

                  <TriStateField
                    label="Is the purchase bill / invoice available?"
                    value={invoiceAvailable}
                    onChange={setInvoiceAvailable}
                  />

                  <TriStateField
                    label="Is the warranty still valid?"
                    value={warrantyValid}
                    onChange={setWarrantyValid}
                  />

                  <TriStateField
                    label="Are any standard accessories missing?"
                    value={hasMissingAccessories}
                    onChange={(v) => {
                      setHasMissingAccessories(v);
                      if (v === false) setMissingAccessories('');
                    }}
                  />
                </div>

                {hasMissingAccessories === true && (
                  <div className="animate-fadeIn">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1">
                      Specify which accessories are missing *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Missing original charging brick, missing lens hood"
                      value={missingAccessories}
                      onChange={(e) => setMissingAccessories(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-narmis-forestDark border border-amber-500/60 text-xs text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                      Warranty Details
                    </label>
                    <select
                      value={warrantyStatus}
                      onChange={(e) => setWarrantyStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream focus:outline-none focus:border-narmis-gold cursor-pointer"
                    >
                      {WARRANTY_OPTIONS.map((w) => (
                        <option key={w} value={w} className="bg-narmis-surface">
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                      Documentation & Handover Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Invoice has personal info redacted; serial matches box"
                      value={documentationNotes}
                      onChange={(e) => setDocumentationNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                    />
                  </div>
                </div>
              </Section>

              {/* SECTION: AGE & ORIGINAL RETAIL PRICE */}
              <div className="p-4 rounded-2xl bg-narmis-forestDark/40 border border-narmis-mountain/60 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                      Product Age
                    </label>
                    <select
                      value={productAgeSelect}
                      onChange={(e) => setProductAgeSelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream focus:outline-none focus:border-narmis-gold cursor-pointer"
                    >
                      {AGE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-narmis-surface">
                          {opt}
                        </option>
                      ))}
                    </select>
                    {productAgeSelect === 'Custom' && (
                      <input
                        type="text"
                        placeholder="e.g. 14 months"
                        value={productAgeCustom}
                        onChange={(e) => setProductAgeCustom(e.target.value)}
                        className="mt-1.5 w-full px-3 py-1.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                      Purchase Date (Optional)
                    </label>
                    <input
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream focus:outline-none focus:border-narmis-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                      Original MRP (₹) (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-narmis-gold font-bold text-xs">₹</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 24990"
                        value={originalMrpStr}
                        onChange={(e) => handleNumericInput(e.target.value, setOriginalMrpStr)}
                        className="w-full pl-7 pr-3 py-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream focus:outline-none focus:border-narmis-gold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 rounded-full bg-narmis-forestDark hover:bg-narmis-mountain text-narmis-cream text-xs font-semibold transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setCurrentStep(3);
                  }}
                  className="px-8 py-3.5 rounded-full bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg"
                >
                  <span>Next: Pricing & Model</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Marketplace Model & Asking Price */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="pb-3 border-b border-narmis-mountain/40 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-narmis-parchment">
                    Step 3: Select Marketplace Model & Set Asking Price
                  </h2>
                  <p className="text-xs text-narmis-cream/70">
                    Choose whether you wish to rent it out, trade it, or sell it directly.
                  </p>
                </div>
                <span className="text-xs text-narmis-gold font-bold">3 of 4</span>
              </div>

              {/* 3 Model Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setListingType('rent')}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    listingType === 'rent'
                      ? 'bg-sky-950/60 border-sky-400 shadow-lg ring-1 ring-sky-400'
                      : 'bg-narmis-forestDark/60 border-narmis-mountain/60 hover:bg-narmis-mountain/30'
                  }`}
                >
                  <Calendar className="w-6 h-6 text-sky-400 mb-2" />
                  <h4 className="font-serif font-bold text-narmis-parchment text-base">RENT</h4>
                  <p className="text-xs text-narmis-cream/70 mt-1">
                    Lend your gear temporarily for hourly, daily, or weekly rates.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setListingType('trade')}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    listingType === 'trade'
                      ? 'bg-amber-950/60 border-amber-400 shadow-lg ring-1 ring-amber-400'
                      : 'bg-narmis-forestDark/60 border-narmis-mountain/60 hover:bg-narmis-mountain/30'
                  }`}
                >
                  <Repeat className="w-6 h-6 text-amber-400 mb-2" />
                  <h4 className="font-serif font-bold text-narmis-parchment text-base">TRADE</h4>
                  <p className="text-xs text-narmis-cream/70 mt-1">
                    Exchange for another item with optional cash adjustment.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setListingType('purchase')}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    listingType === 'purchase'
                      ? 'bg-emerald-950/60 border-emerald-400 shadow-lg ring-1 ring-emerald-400'
                      : 'bg-narmis-forestDark/60 border-narmis-mountain/60 hover:bg-narmis-mountain/30'
                  }`}
                >
                  <ShoppingBag className="w-6 h-6 text-emerald-400 mb-2" />
                  <h4 className="font-serif font-bold text-narmis-parchment text-base">PURCHASE</h4>
                  <p className="text-xs text-narmis-cream/70 mt-1">
                    Sell outright for direct UPI QR payment in INR.
                  </p>
                </button>
              </div>

              {/* Conditional Fields: RENT */}
              {listingType === 'rent' && (
                <div className="p-6 rounded-2xl bg-sky-950/20 border border-sky-600/30 space-y-4">
                  <h3 className="font-serif text-lg font-bold text-sky-200">
                    Rental Asking Rate & Duration
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                        Rental Price (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 font-bold">₹</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="e.g. 500"
                          value={rentalPriceStr}
                          onChange={(e) => handleNumericInput(e.target.value, setRentalPriceStr)}
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                          required
                        />
                      </div>
                      <span className="text-[11px] text-narmis-cream/50 mt-1 block">
                        Clear completely or enter any custom rate (e.g. 50, 500, 1500).
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                        Duration Type
                      </label>
                      <select
                        value={rentalDuration}
                        onChange={(e) => setRentalDuration(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold cursor-pointer"
                      >
                        <option value="Hourly">Hourly</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Fields: TRADE */}
              {listingType === 'trade' && (
                <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-600/30 space-y-4">
                  <h3 className="font-serif text-lg font-bold text-amber-200">
                    Trade Valuation & Wishlist
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                        Your Item Estimated Value (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 font-bold">₹</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="e.g. 4000"
                          value={estimatedValueStr}
                          onChange={(e) => handleNumericInput(e.target.value, setEstimatedValueStr)}
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                        Preferred Cash Adjustment (₹)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="e.g. 500 (extra cash requested/offered)"
                        value={tradeCashAdjustmentStr}
                        onChange={(e) => handleNumericInput(e.target.value, setTradeCashAdjustmentStr)}
                        className="w-full px-3 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                      Items You Wish to Trade For
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mechanical keyboard, DSLR lens, tablet, drone frame"
                      value={tradeDesired}
                      onChange={(e) => setTradeDesired(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                    />
                  </div>
                </div>
              )}

              {/* Conditional Fields: PURCHASE */}
              {listingType === 'purchase' && (
                <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-600/30 space-y-4">
                  <h3 className="font-serif text-lg font-bold text-emerald-200">
                    Direct Selling Price
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                      Asking Price (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">₹</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="e.g. 4500"
                        value={purchasePriceStr}
                        onChange={(e) => handleNumericInput(e.target.value, setPurchasePriceStr)}
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                        required
                      />
                    </div>
                    <span className="text-[11px] text-narmis-cream/50 mt-1 block">
                      Enter any custom price without auto-inserting zeros.
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 rounded-full bg-narmis-forestDark hover:bg-narmis-mountain text-narmis-cream text-xs font-semibold transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setCurrentStep(4);
                  }}
                  className="px-8 py-3.5 rounded-full bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg"
                >
                  <span>Next: Photos & Terms</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Photos, Terms Agreement & Publish */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="pb-3 border-b border-narmis-mountain/40 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-narmis-parchment">
                    Step 4: Upload Product Images & Terms
                  </h2>
                  <p className="text-xs text-narmis-cream/70">
                    Upload real photos of your item and agree to the platform responsibility policy.
                  </p>
                </div>
                <span className="text-xs text-narmis-gold font-bold">4 of 4</span>
              </div>

              {/* Photo Upload Box (Zero default camera image!) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/90">
                    Product Photos (Recommended · {images.length} uploaded)
                  </label>
                  {images.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setImages([])}
                      className="text-[11px] text-red-400 hover:text-red-300 font-medium transition-colors"
                    >
                      Clear all photos
                    </button>
                  )}
                </div>

                {/* Clean drag & drop upload box */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                    isDragging
                      ? 'border-narmis-gold bg-narmis-gold/10 scale-[1.01]'
                      : 'border-narmis-mountain/80 hover:border-narmis-gold/70 bg-narmis-forestDark/50'
                  }`}
                >
                  <Upload className={`w-8 h-8 mx-auto mb-2 transition-transform ${isDragging ? 'text-narmis-gold scale-125' : 'text-narmis-gold'}`} />
                  <p className="text-sm font-semibold text-narmis-parchment">
                    Upload Product Images
                  </p>
                  <p className="text-xs text-narmis-cream/60 mt-1 mb-4">
                    Click to select from your device or drag & drop high-resolution photos here (JPG, PNG, WEBP)
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-2.5 rounded-full bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose Files</span>
                    </button>

                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-5 py-2.5 rounded-full bg-narmis-mountain hover:bg-narmis-mountain/80 text-narmis-parchment text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border border-narmis-gold/30"
                    >
                      <Camera className="w-3.5 h-3.5 text-narmis-gold" />
                      <span>Take Photo</span>
                    </button>
                  </div>
                </div>

                {/* Direct Image URL fallback */}
                <div className="flex gap-2 mt-3">
                  <input
                    type="url"
                    placeholder="Or paste an image web URL..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 rounded-xl bg-narmis-mountain hover:bg-narmis-mountain/80 text-narmis-parchment text-xs font-semibold"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Uploaded Photos Preview OR Category Fallback Preview */}
              {images.length === 0 && (
                <div className="p-4 rounded-2xl bg-narmis-forestDark/70 border border-narmis-mountain/60 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-40 aspect-[4/3] rounded-xl overflow-hidden border border-narmis-gold/30 shrink-0">
                    <CategoryFallbackArtwork category={category} title={title} compact />
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-xs font-bold text-narmis-parchment">
                      Category Fallback Preview ({category})
                    </p>
                    <p className="text-[11px] text-narmis-cream/70 leading-relaxed">
                      If you publish without uploading product photos, NARMIS displays this
                      category illustration instead of a placeholder camera icon. Uploading real
                      photos always takes priority.
                    </p>
                  </div>
                </div>
              )}

              {images.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-narmis-cream/80 font-medium">
                      Photos ({images.length}) — Click <Star className="w-3 h-3 inline text-narmis-gold" /> to set as cover photo
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-square rounded-xl overflow-hidden border group shadow-md transition-all ${
                          idx === 0
                            ? 'border-narmis-gold ring-2 ring-narmis-gold/50'
                            : 'border-narmis-mountain/60 hover:border-narmis-parchment/60'
                        }`}
                      >
                        <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />

                        {idx === 0 && (
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-narmis-gold text-narmis-charcoal text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>Cover</span>
                          </div>
                        )}

                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            title="Set as main cover photo"
                            className="absolute top-1 left-1 p-1 rounded-full bg-black/60 text-narmis-cream/70 hover:text-narmis-gold opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          title="Remove photo"
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-red-400 hover:text-red-300 opacity-90 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="absolute bottom-1 right-1 text-[9px] px-1 bg-black/60 text-white/80 rounded">
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TERMS & CONDITIONS ACKNOWLEDGEMENT (Mandatory, unchecked by default) */}
              <div className="p-5 rounded-2xl bg-narmis-forestDark border border-narmis-gold/30 space-y-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-narmis-gold shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-narmis-parchment text-sm">
                      Product Care & Damage Responsibility Policy
                    </h4>
                    <p className="text-xs text-narmis-cream/80 leading-relaxed">
                      When a user rents or borrows an item through NARMIS, the user accepting possession is responsible for taking reasonable care of it throughout the rental period. Loss, damage, or misuse may require compensation for documented repair or replacement value. Owners and renters should document condition with photos before and after handovers.
                    </p>
                    <Link
                      to="/terms"
                      target="_blank"
                      className="text-xs text-narmis-gold hover:underline inline-flex items-center gap-1 font-semibold pt-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Read Full Terms & Responsibility Policy</span>
                    </Link>
                  </div>
                </div>

                <div className="pt-2 border-t border-narmis-mountain/40">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 rounded text-narmis-gold focus:ring-narmis-gold bg-narmis-surface border-narmis-mountain mt-0.5 shrink-0"
                      required
                    />
                    <span className="text-xs font-semibold text-narmis-parchment">
                      I have read, understood, and actively agree to the NARMIS Product Care and Damage Responsibility Policy, and I confirm the accuracy of all product details. *
                    </span>
                  </label>
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-5 rounded-2xl bg-narmis-surface border border-narmis-mountain/60 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-narmis-gold uppercase tracking-wider">
                  <Eye className="w-4 h-4" />
                  <span>Ready to Publish Summary</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-narmis-cream/60">Product:</span>
                    <p className="font-semibold text-narmis-parchment truncate">{title || 'Untitled'}</p>
                  </div>
                  <div>
                    <span className="text-narmis-cream/60">Condition:</span>
                    <p className="font-semibold text-narmis-parchment">{condition}</p>
                  </div>
                  <div>
                    <span className="text-narmis-cream/60">Model:</span>
                    <p className="font-semibold text-narmis-parchment uppercase">{listingType}</p>
                  </div>
                  <div>
                    <span className="text-narmis-cream/60">
                      {listingType === 'rent' ? 'Rate:' : listingType === 'trade' ? 'Trade Value:' : 'Price:'}
                    </span>
                    <p className="font-serif font-bold text-narmis-gold">
                      ₹{listingType === 'rent' ? `${rentalPriceStr || '0'} / ${rentalDuration}` : listingType === 'trade' ? estimatedValueStr || '0' : purchasePriceStr || '0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 rounded-full bg-narmis-forestDark hover:bg-narmis-mountain text-narmis-cream text-xs font-semibold transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitListing}
                  disabled={isSubmitting || !agreeTerms || images.length === 0}
                  className={`px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xl transition-all flex items-center gap-2 ${
                    !agreeTerms || images.length === 0
                      ? 'bg-narmis-mountain text-narmis-cream/50 cursor-not-allowed'
                      : 'bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal hover:scale-[1.02] active:scale-98'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isEditMode ? 'Saving Changes...' : 'Publishing to Marketplace...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isEditMode ? 'Save Listing Changes' : 'Publish Listing Now'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
