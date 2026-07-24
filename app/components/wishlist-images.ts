type WishlistImage = {
  imageUrl: string;
  sourceUrl: string;
};

const openverseImage = (
  id: string,
  sourceUrl: string,
  directImageUrl?: string,
): WishlistImage => ({
  imageUrl: directImageUrl ?? `https://api.openverse.org/v1/images/${id}/thumb/`,
  sourceUrl,
});

export const wishlistImages: Record<string, WishlistImage> = {
  "Baby Wipes (Bulk Pack)": openverseImage(
    "86d7acbe-5d21-45a9-b2eb-55412f02c321",
    "https://commons.wikimedia.org/w/index.php?curid=72889961",
    "https://upload.wikimedia.org/wikipedia/commons/5/58/Pampers_Sensitive_x12_baby_wipes_lingettes_b%C3%A9b%C3%A9_Feuchtt%C3%BCcher_%282%29.jpg",
  ),
  "Pampers Premium Care Newborn": openverseImage(
    "ec81d987-1dff-4a06-8c2b-c0b30d40c5e1",
    "https://www.flickr.com/photos/185514373@N06/49061020892",
  ),
  "Pampers Premium Care Size 1": openverseImage(
    "ec81d987-1dff-4a06-8c2b-c0b30d40c5e1",
    "https://www.flickr.com/photos/185514373@N06/49061020892",
  ),
  "Diaper Rash Cream": openverseImage(
    "1a8c0eb2-9d03-4408-af2a-5d1bd647181f",
    "https://www.flickr.com/photos/37743612@N05/4703984617",
  ),
  "Baby Wash": openverseImage(
    "2b71c85e-a33a-40b4-a452-ac73b685b750",
    "https://www.rawpixel.com/image/6674931/image-public-domain-illustrations-cute",
  ),
  "Baby Shampoo": openverseImage(
    "81f40418-cf21-4d07-ad23-7d60e1220ee2",
    "https://commons.wikimedia.org/w/index.php?curid=86698009",
    "https://upload.wikimedia.org/wikipedia/commons/f/f3/A_bottle_of_Aveeno_Baby_Wash_%26_Shampoo_02.jpg",
  ),
  "Baby Lotion": openverseImage(
    "1a8c0eb2-9d03-4408-af2a-5d1bd647181f",
    "https://www.flickr.com/photos/37743612@N05/4703984617",
  ),
  "Hooded Towel Set": openverseImage(
    "bf9cef64-b531-4767-b823-8792b05c9917",
    "https://www.flickr.com/photos/130460019@N02/30929595806",
  ),
  "Muslin Swaddle Blanket Set": openverseImage(
    "74b7acb3-cd98-42ef-b286-20ced25d91e6",
    "https://www.flickr.com/photos/26816325@N03/5515559242",
  ),
  "Burp Cloth Set": openverseImage(
    "e4556d33-4a39-49e8-8830-54bdb584a112",
    "https://www.flickr.com/photos/7462037@N03/2925367646",
  ),
  "Bib Set": openverseImage(
    "b4669858-cf0e-449e-aef6-a26c40aece94",
    "https://www.flickr.com/photos/99012110@N00/2536811407",
  ),
  "Newborn Bodysuit Set": openverseImage(
    "34d7617c-49f6-427b-a7ef-9e16ab04bb48",
    "https://www.flickr.com/photos/28069162@N03/5459704982",
  ),
  "Sleepsuit Set": openverseImage(
    "449d4ff0-321d-4fcc-8625-09982f516bd2",
    "https://commons.wikimedia.org/w/index.php?curid=85437150",
    "https://upload.wikimedia.org/wikipedia/commons/0/0d/Blue_babygrow.png",
  ),
  "Socks & Mittens Set": openverseImage(
    "e8c0c14e-ee1a-4834-ae42-897df9662d77",
    "https://www.flickr.com/photos/21135514@N07/5187637899",
  ),
  "Digital Baby Thermometer": openverseImage(
    "784f979d-e361-4348-9410-cef2c9ad278e",
    "https://www.flickr.com/photos/185514373@N06/49063385728",
  ),
  "Baby Nail Care Kit": openverseImage(
    "16f2322c-7386-4212-8dcd-f6fb6836acf7",
    "https://www.flickr.com/photos/45040421@N06/50768892856",
  ),
  "Pacifier (0–6 Months)": openverseImage(
    "1e873b64-e157-4fe7-9b01-326efdeac80a",
    "https://www.flickr.com/photos/63807998@N05/20151750260",
  ),
  "Bottle Drying Rack": openverseImage(
    "9101dcf5-35e8-4249-a9b5-d42eb4fe735c",
    "https://commons.wikimedia.org/w/index.php?curid=140748644",
    "https://upload.wikimedia.org/wikipedia/commons/1/11/Splash_Bottle_Dryer_by_Skip_Hop.jpg",
  ),
  "Baby Bottle Starter Set": openverseImage(
    "f43a3071-dea3-40f1-9581-8f75224b2d10",
    "https://www.flickr.com/photos/11657835@N00/3055724951",
  ),
  "Baby Laundry Detergent": openverseImage(
    "4ddd8553-7604-495a-8ed3-9836ee9a651f",
    "https://www.flickr.com/photos/39160147@N03/15075395656",
  ),
  "Nursery Storage Basket": openverseImage(
    "b33275b3-98ed-47d8-bf2e-40fd65e13eac",
    "https://www.rawpixel.com/image/6041375/photo-image-public-domain-free",
  ),
  "Portable Changing Mat": openverseImage(
    "facc59d2-f826-452d-8248-94443a81fb32",
    "https://commons.wikimedia.org/w/index.php?curid=91070033",
    "https://upload.wikimedia.org/wikipedia/commons/1/1e/Portable_baby-changing_mat%2C_Oude_Pekela_%282020%29_03.jpg",
  ),
  "Baby Grooming Kit": openverseImage(
    "1a8c0eb2-9d03-4408-af2a-5d1bd647181f",
    "https://www.flickr.com/photos/37743612@N05/4703984617",
  ),
  "Waterproof Crib Protector": openverseImage(
    "1e73110a-a9f1-4753-af65-9ab3eba13e2e",
    "https://www.flickr.com/photos/152189565@N04/33841495696",
  ),
  "Disposable Changing Pads": openverseImage(
    "8bc30266-771e-4e0f-991c-892cfef13d4f",
    "https://www.flickr.com/photos/89181244@N00/1074447276",
  ),
  "Silicone Teether (3+ Months)": openverseImage(
    "528d05b6-cb99-4c80-8e94-36ebda9754f2",
    "https://commons.wikimedia.org/w/index.php?curid=6812683",
    "https://upload.wikimedia.org/wikipedia/commons/b/b0/Teething_Ring.jpg",
  ),
  "Babyshop Gift Card": openverseImage(
    "6e7f3e14-19b3-4f1b-ae52-5561452bd304",
    "https://www.flickr.com/photos/79891443@N00/2161322296",
  ),
  "Mothercare Gift Card": openverseImage(
    "df957851-2897-4001-8c01-319b51927d8a",
    "https://www.flickr.com/photos/35323150@N02/3389668627",
  ),
};
