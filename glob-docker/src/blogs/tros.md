# Booting rust code with UEFI

## How it all started
Recently at UNSW's Devsoc Starlight event, I had the pleasure chatting with one of the
recruiters from Arista Networks about operating systems (since the software team there
mostly worked on EOS, their cloud enterprise operating system). Having worked on my own
operating system(s) that all ended in some sort of failures **[1, 2, 3]**, I was more than happy to
complain about my troubles with developing operating systems, going on a massive tirade about 
how bootloaders were the work of the devil, mentioning the hacky ways we had to get
booting to work (alongside classic x86 slander (I LOVEEEEE READING 800 pages of
documentation **[4]**)).    

Regardless, admist my rant on how we had to stich the kernel binary ([bind_kernel.py](https://github.com/nouveaus/kaolin/blob/main/tools/bind_kernel.py))
size at compile time into our bootloader's binary so we can call syscalls to load it into
memory, he mentions "you can just boot a kernel without a bootloader"   

"...what?"   

"Yeah! you can just boot it from uefi"   

"huh"   


## Lets look into this

So after that exchange and getting home, I decided its time I looked into this **[5, 6]**.

```md
An ESP (note from ronnie: ESP stands for efi system partition) contains the boot loaders
or kernel images of installed operating systems ... and used by the firmware at boot 
time, system utility programs that are intended to be run before an operating system 
is booted[5]
```

Huh! So it appears that uefi is actually really nice to us if we don't use a bootloader,
and we can just throw our kernel on there and have it boot properly!

A few questions crept up though:
- what binary format does it recognise? 
- where does this kernel need to live?
- how do we create an `esp`?

### What binary format does the kernel need to be in?

from **[5]**
```md
Linux Kernel EFI Boot Stub

EFI Boot Stub makes it possible to boot a Linux kernel image without the use of a 
conventional UEFI boot loader. By masquerading as a PE/COFF executable image and 
appearing to the firmware as a UEFI application, a Linux kernel image with EFI Boot Stub
enabled can be directly loaded and executed by a UEFI firmware. 
```

huh! a PE/COFF executable image... Lets look into what that is! **[7, 8]**

```md
Portable Executable (PE) is a file format for native executable code on 32-bit and 
64-bit Windows operating systems, as well as in UEFI environments.
```

Wonderful! So we can just compile our code as a PE/COFF executable! good to know, keeping
that in the back of my mind :D

### Where does this kernel need to live?

I remembered reading something about an "uefi boot stub". Lets look it up!

Heres a nice resource by the linux kernel guide **[9]** and an interesting reddit thread
**[10]**

```md
On the x86 and ARM platforms, a kernel zImage/bzImage can masquerade as a PE/COFF image,
thereby convincing EFI firmware loaders to load it as an EFI executable.[9]
```

and from reddit:
```md
The efi/boot/bootx64.efi path is a special path for UEFI. Firmwares will always attempt
to boot that path if no others are configured. This is useful for things like bootable USBs
or devices without configurable firmware.
```

right! so we just throw our binary as `bootx64.efi` into `/efi/boot` for the drive we're
booting off. But what filesystem does our drive need to be in then? 

Well, from **[5]**,

```md
The EFI system partition is formatted with a file system whose specification is based on
the FAT file system and maintained as part of the UEFI specification
```

Sounds good! so we just create a `.img` file formatted as `fat32`, and throw our binary
into `/boot/efi/`!

## wait, can i do it in 1 day???

At this point, its only been an hour of research. Can I successfully boot rust code? 

Well, we know what to do now, right? Compile our binary as a `PE32+`, throw it into a
`fat32` img file in the right directory, and boot off it with `qemu`!

Lets first install `qemu` before we do anything:

```bash
sudo dnf install qemu
```

The easy part is over! How do we compile our binary as a `PE32+` now?

### Compiling is also easy, actually!

Well, looking at the rust cross compilation docs **[10, 11]**, this is pretty chill
actually! Rustup is nice and easy to use, and has cross compilation built in so we can
just run a simple

```bash
rustup target list
```

to view all our target architectures we're compiling for:

```bash
...
x86_64-unknown-linux-gnu (installed)
...
x86_64-unknown-linux-ohos
x86_64-unknown-netbsd
x86_64-unknown-none
x86_64-unknown-redox
x86_64-unknown-uefi 
```

Ah! `x86_64-unknown-uefi` is probably what we're looking for... Lets make sure by reading
its docs: **[11]**

```md
Tier: 2

Unified Extensible Firmware Interface (UEFI) targets for application, driver, and core 
UEFI binaries.

Available targets:

    aarch64-unknown-uefi
    i686-unknown-uefi
    x86_64-unknown-uefi
```

and down below a bit more...

```md
By default, the UEFI targets use the link-flavor of the LLVM linker lld to link binaries 
into the final PE32+ file suffixed with *.efi
```

There we go!!! it compiles as a `PE32+` binary, so we can definitely boot off that!

Lets add it to our list with
```
❯ rustup target add x86_64-unknown-uefi
```

and start our project! 

### The code (trivial)

We don't actually need to write any code! The `unknown-uefi` target for rust actually
provides a `no-std` environment, meaning that (and im willing to bet) that stdout
libraries are actually adapted to print in uefi environemnts:

```md
All UEFI targets can be used as no-std environments via cross-compilation. 
```

We can have our fully default program:
```rust
❯ cat src/main.rs
fn main() {
    println!("Hello, world!");
    loop {}
}
```

and compile it with

```
cargo build --target x86_64-unknown-uefi
```

and we get a `boot.efi` binary! Lets check for no dynamic linking with `ldd` and ensure
that it is indeed a `PE32+` with `file`:

`ldd output:`
```bash

❯ ldd boot.efi
	not a dynamic executable
```

`file output:`
```bash
❯ file boot.efi
boot.efi: PE32+ executable for EFI (application), x86-64, 6 sections
```

This is incredible! I'm so used to waiting ~4 hours waiting for my cross compiler to
finish compiling that having such a trivial solution for rust gets me giddy :D

### Could I have done it with C?

probably, but it would have been super slow since I would've needed my own cross compiler.
Rust also abstracted and did some really nice things for me, such as `println!()` printing
to the video buffer in uefi mode. With C, I would've needed to write our own `VGA` video
buffer library to even print to terminal ([heres our own videobuffer library witten for
`kaolin`](https://github.com/nouveaus/kaolin/blob/main/kernel/src/arch/x86_64/vga/vga.c#L57))

We'll get into this later. 

### Building the bootable media

If you recall from our investigation, we need to create a `fat` `.img` file! This should
be pretty simple with a few linux commands...

#### creating the `.img`
`boot.efi` is ~62kb big, lets create a 2mb `.img` file!

```bash
❯ dd if=/dev/zero of=boot.img bs=2M count=1 status=progress

1+0 records in
1+0 records out
2097152 bytes (2.1 MB, 2.0 MiB) copied, 0.00127979 s, 1.6 GB/s


```

#### formatting with `fat32`
just a simple `mkfs.vfat -F32` will do the trick!

```bash
❯ mkfs.vfat -F32 boot.img
mkfs.fat 4.2 (2021-01-31)
WARNING: Number of clusters for 32 bit FAT is less then suggested minimum.
```

huh... Maybe our image isnt big enough... Lets remake it!

```bash
❯ dd if=/dev/zero of=boot.img bs=1M count=64
64+0 records in
64+0 records out
67108864 bytes (67 MB, 64 MiB) copied, 0.0282596 s, 2.4 GB/s
❯ mkfs.vfat -F32 boot.img
mkfs.fat 4.2 (2021-01-31)
```

#### copying the binary into `boot.img`
Well, since `boot.img` is already has a `fat32` filesystem in it, we can just mount it
into a directory and create the files!
```bash
❯ sudo mount boot.img /mnt
❯ sudo mkdir /mnt/boot
❯ sudo mkdir /mnt/boot/efi
```

We can now copy the `boot.efi` as `bootx64.efi` into `/mnt/boot/efi` and we *should* be
able to boot off it!

```bash
❯ sudo cp boot.efi /mnt/boot/efi/bootx64.efi
❯ ls /mnt
boot
❯ ls /mnt/boot
efi
❯ ls /mnt/boot/efi
bootx64.efi
```
LGTM! lets `umount` and boot :D

### booting

nice! Lets try booting with qemu...

```bash
❯ qemu-system-x86_64 -drive file=boot.img
```
and it fails...?

![fails](/tros/fail.png "the failure")

hmm... Well it says its not a bootable disk? Maybe UEFI isn't actually running here?

Ah!! It turns out that `qemu` is booting off `SeaBIOS` which only knows MBR, not UEFI! We
can just tell `qemu` to boot using `OVMF` and it should be good now!

```
qemu-system-x86_64 -bios /usr/share/OVMF/OVMF_CODE.fd -drive file=boot.img,format=raw
```

![fails](/tros/fail2.png "the failure")

hmm... lets retrace our steps...

AH!!!! i copied it in as `/boot/efi`, not `/efi/boot`... let me fix that up...

```bash

❯ sudo mount boot.img /mnt
❯ cd /mnt
❯ ls
boot
❯ sudo mv boot efi
❯ cd efi
❯ ls
efi
❯ sudo mv efi boot
❯ ls
boot
❯ cd boot
❯ ls
bootx64.efi

❯ sudo umount /mnt
```
And lets try again...

It boots!
![success](/tros/success.mp4 "yay")

# References
[1] https://github.com/nouveaus/kaolin  
[2] https://github.com/suwuako/Penjamin  
[3] https://github.com/suwuako/helloworld.os  
[4] https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html  
[5] https://wiki.archlinux.org/title/EFI_system_partition  
[6] https://en.wikipedia.org/wiki/EFI_system_partition  
[7] https://en.wikipedia.org/wiki/COFF  
[8] https://en.wikipedia.org/wiki/Portable_Executable  
[9] https://docs.kernel.org/admin-guide/efi-stub.html  
[10] https://www.reddit.com/r/archlinux/comments/pv51om/efibootbootx64efi_why_is_it_there/
[11] https://esp32.implrust.com/std-to-no-std/cross-compilation/index.html
[12] https://doc.rust-lang.org/rustc/platform-support/unknown-uefi.html
