# running code on an AI (npu) chip

## My laptop broke :(

A few months ago, my trusty Dell latitutde 13 5300's battery gave out. I had to replace
the battery around 4 years ago, and I decided in the moment that its time to get a new
laptop, since I've been using it for almost 10 years now. 

## Time to get a new laptop!

I've always been interested in framework laptops. Their stuff seems really cool and the idea of
being able to repair or upgrade my laptop is really sick to me. So i decided to look into
the framework 13. 

One of the options for a processor was a "Ryzen AI"
chip. Personally, I'm not a huge fan of AI but I'm also not against checking out new
technologies! As such, after some research on the processor, I've shelled out an extra 
$200 and after a few weeks, the laptop arrived. 

```bash
❯ lscpu | grep -i ryzen
Model name:                              AMD Ryzen AI 5 340 w/ Radeon 840M
```

Wonderful(?)! Its an "AI" chip.

## so what does it actually do?

looking at amd's website (1), it states for the Ryzen AI 5 340:

```md
AI engine capabilities
Overall TOPS
    Up to 59 TOPS 
NPU TOPS
    Up to 50 TOPS 
```

Facinating. Lets figure out what `TOPS` is and what this chip actually does.

### an NPU

So it turns out my cpu has a NPU, a neural processing unit (2). They can handle lots of
small bitwidth operations (`int4, int8, fp4, fp8`) operations and this is measured in
`TOPS`, which is "trillion operations per second". So given this, I assume my processor
can handle 50 trillion operations per second? 

Very cool. 

## Lets try getting an instruction executed on the npu

Cool. I want to figure out how to get instrucitons executred on the npu, just like how a
stream of instructions are fed into the cpu. 

As always, lets have an educated guess on how an npu works, how it gets flashed and ran
from userspace.

### the educated guess

well no matter what, the code would need to first make its way through the kernel. So that
means that a compiled binary for the npu either gets loaded into a different process 
(almost like an interpreter), which then passes on the data to the kernel which hands it
off to a driver. 

An alternative would be to have the npu binary be compiled into a userspace ELF program,
which informs the kernel and does the whole kernel driver thing to hand it off to the npu.

Either way, its probably a different archtecture (lol obviously) from the cpu, so I think
its worth looking into how (and what) binary type the code would be.

### .xclbin

Not sure if my hypotheses are correct, but according to amd's documentation (3), (4),
theres a file format called an `xclbin` file that is used to load code for fpgas, npus,
and whatnot. 

But then that leads to two questions:
- how do we compile an xclbin file?
- how do we get it on the npu?

### compiling an xclbin

### from userspace to NPU

## actually doing it

## What next?

Well, given that it can handle trillions of operations per second which involve matrices,
why not try it out? 

Theres a competitive programming technique with dynamic programming where given large
enough state (think hundrds of trillions, `10^18`), instead of using standard memoization,
we instead can use matrices to compute future state. 

## Theorycrafting

Heres the general idea. Assuming we have some dynamic programming problem (henceforth
referred to as dp) that relies on
past state. Lets do a simple example using a pretty standard dp.

```cpp
dp(i) = dp(i - 1) + dp(i - 2)
```
where our base cases are
```cpp
dp(0) = 1 
dp(1) = 1
```

Here, our recurrence says to find the result of the `ith` state, you take the sum of the
`i-1th` and `i-2nd` states.

The typical idea would be to create an array (or lookup table) that stores the result of
each state's result. However, it would be pretty infeasible to store 18 trillion results
given a large enough occurence bound. 

This is where matrices come in. If we can create an operation such that when applied on
a given transformation and a current state, then we can "advance" it to the next state. 

this is very very abstract and I wouldn't expect anyone who isnt familiar with this
concept to grasp it immediately, so lets run through an example by converting our dp
example into a matrix multiplicaiton. 

First, lets think of our initial state. we know that `dp(0) = dp(1) = 1`, so lets create a
2d vector representative of both states:
```cpp
[dp(0)
dp(1)]
```




# References
(1) https://www.amd.com/en/products/processors/laptop/ryzen/ai-300-series/amd-ryzen-ai-5-340.html  
(2) https://en.wikipedia.org/wiki/Neural_processing_unit  
(3) https://ryzenai.docs.amd.com/en/ryzen-ai-1.0.1/runtime_setup.html  
(4) https://ryzenai.docs.amd.com/en/latest/getstartex.html  
