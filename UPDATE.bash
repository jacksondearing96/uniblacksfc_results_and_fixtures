#!/bin/bash

# Create file with update instructions for VM
echo "./update.bash" >> temp_updateInstructions.txt
echo "exit" >> temp_updateInstructions.txt

# Write c file to ssh into virtual machine and update website
echo "#include <stdio.h>" >> update.c
echo "#include <unistd.h>" >> update.c
echo "#include <stdlib.h>" >> update.c
echo "#include <fcntl.h>" >> update.c
echo "int main()"  >> update.c
echo "{" >> update.c
echo '    int instructions = open("temp_updateInstructions.txt", O_RDONLY);' >> update.c
echo "    dup2(instructions, 0);" >> update.c
echo "    close(instructions);" >> update.c
echo '    char* ssh = "ssh -i ""~/.ssh/JacksKeyPair.pem"" ec2-user@ec2-35-174-154-8.compute-1.amazonaws.com";' >> update.c
echo "    system(ssh);" >> update.c
echo "    return 0;" >> update.c
echo "}" >> update.c

# Compile and run update program
gcc update.c -o updateBinary
./updateBinary

# Clean up temporary files
rm updateBinary
rm update.c
rm temp_updateInstructions.txt

# Indicate completion
echo ""
echo "### FINISHED UPDATING ###"
echo ""