print('hi there')

local sum = 1 + 1
print('sum is equal to ' .. sum)

if sum > 0 then
    print('sum is greater than 0')
end

if sum ~= 0 then
    print('sum is not equal to 0')
end

if 0 and '' then
    print('zero is truthy')
end

if not nil then
    print('nil is falsy')
end

if not false or true then
    print('use not to flip a boolean')
end

for i = 5, 10 do
    print(i)
end
